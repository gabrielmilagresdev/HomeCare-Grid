import { spawnSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { executorFor, assignIssue, validateMode, orderedStories, queue, readiness } from '../scripts/dual-agent-policy.mjs';
import { initialize, cloneSpec, prepare } from '../scripts/dual-agent.mjs';
const read = async file => JSON.parse(await fs.readFile(new URL('../' + file, import.meta.url), 'utf8'));
const [mode,plan,map] = await Promise.all(['.agents/mode.json','docs/agile/backlog.json','docs/agile/github-map.json'].map(read));
const completed = number => ({number,state:'closed',state_reason:'completed',labels:['integration:verified'],body:''});
const original = (story,status='ready') => ({number:map[story.id].number,state:'open',labels:['owner:'+story.owner,'agent:'+story.role,'status:'+status],body:assignIssue('## Critérios de aceite\n- [ ] Validar\n',story,mode)});
test('all MVP implementation Stories route to Lucas, original owners and future remain intact',()=>{
  const before=JSON.stringify(plan);validateMode(mode,plan);
  for(const story of plan.stories)assert.equal(executorFor(story,mode),story.epic==='F'?story.owner+'-'+story.role:story.role==='arbiter'?'lucas-arbiter':'lucas-operational');
  assert.equal(JSON.stringify(plan),before);assert.ok(plan.stories.some(s=>s.owner==='gabriel'));assert.ok(plan.stories.some(s=>s.owner==='julio'));
});
test('executor assignment is idempotent and preserves criteria/history',()=>{
  const story=plan.stories.find(s=>s.owner==='matheus'&&s.epic!=='F');
  const body='Responsável lógico: Matheus\n## Critérios de aceite\n- [x] Existing evidence\nBlocked by #17\n';
  const next=assignIssue(body,story,mode);assert.equal(assignIssue(next,story,mode),next);
  assert.ok(next.startsWith(body.trimEnd()));assert.match(next,/Responsável original: matheus/);assert.match(next,/Executor atual: lucas-operational/);
  assert.throws(()=>assignIssue('<!-- hcg:dual-agent-assignment:start -->',story,mode),/Malformed/);
});
test('preference is topological: roles precede navigation and match precedes marketplace',()=>{
  const ordered=orderedStories(plan,mode),ids=ordered.map(s=>s.id);
  assert.equal(ids.length,31);assert.equal(new Set(ids).size,31);
  for(const story of ordered)for(const dep of story.dependsOn)if(dep!=='BOOT')assert.ok(ids.indexOf(dep)<ids.indexOf(story.id),story.id+' depends on '+dep);
  assert.ok(ids.indexOf('2.2')<ids.indexOf('1.2'));assert.ok(ids.indexOf('3.4')<ids.indexOf('3.2'));
  assert.equal(ids.some(id=>id.startsWith('F.')),false);
});
test('missing Story, duplicate preference and cyclic dependencies fail closed',()=>{
  assert.throws(()=>validateMode({...mode,preference:mode.preference.slice(1)},plan),/cover/);
  assert.throws(()=>validateMode({...mode,preference:[...mode.preference.slice(1),mode.preference[1]]},plan),/cover/);
  const p=structuredClone(plan);p.stories[0].dependsOn=[p.stories[0].id];assert.throws(()=>orderedStories(p,mode),/Cycle/);
});
function readyFixture() {
  const story=plan.stories.find(s=>s.id==='1.1'),issue=original(story);
  const dependencies=story.dependsOn.map(id=>completed(map[id].number));
  return {story,issue,issues:[issue,...dependencies]};
}
test('Ready requires every real dependency closed/completed/verified',()=>{
  const f=readyFixture();assert.equal(queue(plan,map,mode,f.issues).next.number,f.issue.number);
  f.issues[1].state_reason='not_planned';assert.equal(queue(plan,map,mode,f.issues).next,null);
  f.issues[1]=completed(f.issues[1].number);f.issues[1].labels=[];assert.equal(queue(plan,map,mode,f.issues).next,null);
});
test('editing Issue text cannot remove canonical dependencies; extra dependencies also apply',()=>{
  const f=readyFixture();f.issues.splice(1,1);assert.equal(queue(plan,map,mode,f.issues).next,null);
  const g=readyFixture();g.issue.body+='\nBlocked by #999';assert.equal(queue(plan,map,mode,g.issues).next,null);
});
test('an implementation in progress/review/changes-requested blocks the next task',()=>{
  const f=readyFixture(),other=plan.stories.find(s=>s.id==='2.3');
  for(const status of ['in-progress','in-review','changes-requested']){
    const q=queue(plan,map,mode,[...f.issues,original(other,status)]);assert.equal(q.next,null);assert.deepEqual(q.active,[map[other.id].number]);
  }
});
test('closed Issue, future work and missing executor metadata are not candidates',()=>{
  const f=readyFixture();f.issue.state='closed';assert.equal(queue(plan,map,mode,f.issues).next,null);
  const g=readyFixture();g.issue.body='';assert.equal(queue(plan,map,mode,g.issues).next,null);
  const h=readyFixture();h.issue.labels.push('status:blocked');assert.equal(queue(plan,map,mode,h.issues).next,null);
});
const gates=['separateWorkspaces','codexConfigLoaded','modelAuthenticated','githubAuthenticated','operatorMergeDenied','nativeProtection','currentCi','independentHumanReview','sandboxEnforced'];
function evidence() {return {expiresAt:100,identities:{operational:'Lucas-Phelipe',arbiter:'Lucas-Phelipe'},gates:Object.fromEntries(gates.map(g=>[g,true])),proofs:Object.fromEntries(gates.map(g=>[g,'proof://admin-verified/'+g]))};}
test('same Lucas login does not pretend technical independence; Gabriel approval still required',()=>{
  const issues=[2,17,59].map(completed),e=evidence(),r=readiness(mode,e,issues,0);
  assert.equal(r.ready,true);assert.equal(r.independentTechnicalIdentities,false);assert.equal(r.humanApprover,'gabrielmilagresdev');
  e.gates.independentHumanReview=false;assert.equal(readiness(mode,e,issues,0).ready,false);
  assert.equal(readiness({...mode,github:{...mode.github,humanApprover:'Lucas-Phelipe'}},evidence(),issues,0).ready,false);
});
test('five-container/broker Issues are optional while foundation/security remain mandatory',()=>{
  assert.equal(readiness(mode,evidence(),[2,17,59].map(completed),0).ready,true);
  for(const n of [2,17,59])assert.equal(readiness(mode,evidence(),[2,17,59].filter(v=>v!==n).map(completed),0).ready,false);
  const e=evidence();delete e.proofs.operatorMergeDenied;assert.equal(readiness(mode,e,[2,17,59].map(completed),0).ready,false);
  assert.equal(readiness(mode,{...evidence(),expiresAt:0},[2,17,59].map(completed),1).ready,false);
});
async function temp(t) {const base=await fs.realpath(os.tmpdir()),dir=await fs.mkdtemp(path.join(base,'hcg-dual-'));t.after(async()=>{assert.ok(path.resolve(dir).startsWith(base+path.sep+'hcg-dual-'));await fs.rm(dir,{recursive:true,force:true});});return dir;}
test('initialization creates only two isolated homes/workspaces without activation or global writes',async t=>{
  const root=await temp(t),manifest=await initialize(root);
  assert.equal(manifest.active,false);assert.deepEqual(Object.keys(manifest.roles),['lucas-operational','lucas-arbiter']);
  const paths=Object.values(manifest.roles).flatMap(r=>[r.workspace,r.codexHome]);assert.equal(new Set(paths).size,4);
  for(const role of Object.values(manifest.roles)){assert.equal(role.cloned,false);assert.equal(role.authenticated,false);assert.ok((await fs.readFile(path.join(role.codexHome,'config.toml'),'utf8')).includes('network_access = false'));}
  await assert.rejects(initialize(root),/refusing overwrite/);
});
test('clone credentials are ephemeral and absent from URL/arguments',()=>{
  assert.throws(()=>cloneSpec('/runtime','lucas-operational',''),/missing/);
  assert.throws(()=>cloneSpec('/runtime','gabriel-operational','test'),/Unknown/);
  const spec=cloneSpec('/runtime','lucas-operational','synthetic-test-secret');
  assert.equal(spec.args.includes('develop'),true);assert.equal(spec.args.join(' ').includes('synthetic-test-secret'),false);
  assert.equal(spec.env.GIT_TERMINAL_PROMPT,'0');assert.equal(spec.env.GH_TOKEN,undefined);assert.equal(spec.env.HOME.includes('trusted-preparation'),true);
});
test('preparation refuses to overwrite an existing workspace',async t=>{
  const root=await temp(t);const manifest=await initialize(root);await fs.writeFile(path.join(manifest.roles['lucas-operational'].workspace,'existing.txt'),'preserve');
  await assert.rejects(prepare(root,'synthetic',async()=>({ok:true})),/not empty/);
  assert.equal(await fs.readFile(path.join(manifest.roles['lucas-operational'].workspace,'existing.txt'),'utf8'),'preserve');
});
test('failed clone never marks a workspace cloned or authenticated',async t=>{
  const root=await temp(t);await initialize(root);await assert.rejects(prepare(root,'synthetic',async()=>({ok:false})),/Clone failed/);
  const m=JSON.parse(await fs.readFile(path.join(root,'manifest.json'),'utf8'));assert.equal(m.roles['lucas-operational'].cloned,false);assert.equal(m.active,false);
});

test('legacy bulk sync cannot reset live acceptance in dual mode',()=>{
  const result=spawnSync(process.execPath,['scripts/github-sync.mjs','--apply'],{cwd:new URL('../',import.meta.url),encoding:'utf8',windowsHide:true,env:{PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,TEMP:process.env.TEMP,TMP:process.env.TMP}});
  assert.notEqual(result.status,0);assert.match(result.stderr,/Bulk legacy sync disabled in DUAL_AGENT_MODE/);
});
