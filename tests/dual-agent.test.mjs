import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { executorFor, assignIssue, validateMode, orderedStories, queue } from '../scripts/dual-agent-policy.mjs';
import { main } from '../scripts/dual-agent.mjs';
const read=async p=>JSON.parse(await fs.readFile(new URL('../'+p,import.meta.url),'utf8'));
const [mode,plan,map]=await Promise.all(['.agents/mode.json','docs/agile/backlog.json','docs/agile/github-map.json'].map(read));
test('dual mode gives the operational agent project-wide scope without human/administrative gates',()=>{
  assert.equal(mode.fileScope,'entire-project');assert.equal(mode.github.humanApprovalRequired,false);assert.deepEqual(mode.requiredFoundationIssues,[]);assert.equal(validateMode(mode,plan),true);
});
test('historical owners and assignment bodies remain preserved/idempotent',()=>{
  const story=plan.stories.find(s=>s.owner==='matheus'&&s.epic!=='F'),body='## Aceite\n- [x] Evidência existente\n';
  const updated=assignIssue(body,story,mode);assert.equal(assignIssue(updated,story,mode),updated);assert.ok(updated.startsWith(body.trimEnd()));
  for(const s of plan.stories)if(s.epic!=='F')assert.equal(executorFor(s,mode),s.role==='arbiter'?'lucas-arbiter':'lucas-operational');
});
test('administrative references become history while technical dependencies stay topological',()=>{
  const ordered=orderedStories(plan,mode),ids=ordered.map(s=>s.id);assert.equal(ids.length,26);assert.equal(ids.some(id=>id.startsWith('0.')||id.startsWith('F.')),false);
  assert.ok(ids.indexOf('2.2')<ids.indexOf('1.2'));assert.ok(ids.indexOf('3.4')<ids.indexOf('3.2'));
  const nav=plan.stories.find(s=>s.id==='1.2');assert.ok(nav.originalDependsOn.includes('0.1'));assert.ok(nav.dependsOn.includes('2.2'));assert.equal(nav.dependsOn.includes('0.1'),false);
  for(const s of ordered)for(const d of s.dependsOn)assert.ok(ids.indexOf(d)<ids.indexOf(s.id));
});
test('roadmap does not require blocked labels to be administratively changed',()=>{
  const story=plan.stories.find(s=>s.id==='1.1'),issues=[{number:map[story.id].number,state:'open',labels:['status:blocked'],body:''}];
  const q=queue(plan,map,mode,issues);assert.equal(q.roadmap.length,1);assert.equal(q.roadmap[0].executor,'lucas-operational');
});
test('missing Story, duplicates and technical cycles still fail',()=>{
  assert.throws(()=>validateMode({...mode,preference:mode.preference.slice(1)},plan),/cover/);
  const p=structuredClone(plan);p.stories.find(s=>s.id==='1.1').dependsOn=['1.1'];assert.throws(()=>orderedStories(p,mode),/Cycle/);
});
test('check command no longer waits for manifests, clones, human approval or old pilot evidence',async()=>{
  const result=await main(['check']);assert.equal(result.administrativeGates,false);assert.equal(result.humanApprovalRequired,false);assert.equal(result.scope,'entire-project');
});
