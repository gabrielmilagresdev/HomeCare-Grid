import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluatePullRequest, linkedIssues, snapshotErrors, technicalBlockers } from '../scripts/pr-policy.mjs';
import { runPolicy } from '../scripts/check-pr.mjs';
const repository='gabrielmilagresdev/HomeCare-Grid';
const issue={number:34,state:'open',labels:[{name:'status:blocked'}],body:'Blocked by #2\nBlocked by #17'};
const pr=()=>({number:62,state:'open',body:'Refs #34',head:{ref:'codex/hackathon-mvp',sha:'a'.repeat(40),repo:{full_name:repository}},base:{ref:'develop',sha:'b'.repeat(40)}});
async function evaluate(p=pr(),i=issue){return evaluatePullRequest({pr:p,repository,readIssue:async n=>{assert.equal(n,34);return i;}});}
test('MVP traceable in codex branch passes without closing administrative Issues',async()=>{
  const result=await evaluate();assert.deepEqual(result.errors,[]);assert.equal(result.issueNumber,34);assert.equal(result.requiresTechnicalReview,true);assert.equal(result.requiresIndependentReview,false);
});
test('missing/multiple principal references fail traceability',async()=>{
  for(const body of [null,'','Refs #34\nRefs #2'])assert.ok((await evaluate({...pr(),body})).errors.some(e=>e.includes('Rastreabilidade')));
});
test('comments, quotes and fenced code do not supply Issue authorization',()=>{
  assert.deepEqual(linkedIssues('<!-- Refs #1 -->\n> Refs #2\n```md\nRefs #3\n```'),[]);
  assert.deepEqual(linkedIssues('Refs #34\nOutras: #18 #19 #20'),[34]);
});
test('principal must be an Issue rather than a PR',async()=>{
  assert.ok((await evaluate(pr(),{...issue,pull_request:{}})).errors.some(e=>e.includes('não um PR')));
});
test('historical closed Issue and labels do not substitute or block technical review',async()=>{
  assert.deepEqual((await evaluate(pr(),{...issue,state:'closed',state_reason:'completed',labels:[]})).errors,[]);
});
test('declared technical blockers prevent merge; checked blockers do not',async()=>{
  const p=pr();p.body+='\n## Bloqueios técnicos\n- [ ] Corrigir falha de tipo\n';
  assert.ok((await evaluate(p)).errors.some(e=>e.includes('bloqueios técnicos')));
  p.body=p.body.replace('[ ]','[x]');assert.deepEqual((await evaluate(p)).errors,[]);
  assert.equal(technicalBlockers('Technical-blocker: compilação falha').length,1);
});
test('ordinary Agile checklists are not mandatory administrative approval',async()=>{
  const p=pr();p.body+='\n## Critérios de aceite\n- [ ] Revisar evidência funcional\n';
  assert.deepEqual((await evaluate(p)).errors,[]);
});
test('old head/base/metadata snapshot cannot approve current PR',()=>{
  const p=pr();for(const old of [{...p,number:99},{...p,head:{...p.head,sha:'c'.repeat(40)}},{...p,base:{...p.base,sha:'d'.repeat(40)}}])assert.ok(snapshotErrors(p,old).length);
});
test('main receives develop of the same repository; other destinations fail',async()=>{
  const p=pr();p.base.ref='main';assert.ok((await evaluate(p)).errors.some(e=>e.includes('main recebe')));
  p.head.ref='develop';assert.deepEqual((await evaluate(p)).errors,[]);
  p.head.repo.full_name='other/repo';assert.ok((await evaluate(p)).errors.some(e=>e.includes('Origem')));
  p.base.ref='random';assert.ok((await evaluate(p)).errors.some(e=>e.includes('Destino')));
});
const env={GITHUB_REPOSITORY:repository,GH_TOKEN:'test-only'};
function mock(live,{status=200}={}){const calls=[];return {calls,request:async(url,options)=>{calls.push(url);assert.equal(options.headers.Authorization,'Bearer test-only');return {ok:status===200,status,json:async()=>url.includes('/pulls/')?live:issue};}};}
test('adapter uses current description and only traceability reads',async()=>{
  const p=pr(),event={...pr(),body:null},m=mock(p);
  assert.deepEqual((await runPolicy({pull_request:event},env,m.request)).errors,[]);
  assert.equal(m.calls.length,2);assert.equal(m.calls.some(u=>u.includes('/contents/')),false);
});
test('adapter rejects stale CI before consulting Issue',async()=>{
  const live=pr();live.head.sha='c'.repeat(40);const m=mock(live);
  await assert.rejects(runPolicy({pull_request:pr()},env,m.request),/obsoleta/);assert.equal(m.calls.length,1);
});
test('GitHub errors fail closed and do not expose response body or token',async()=>{
  await assert.rejects(runPolicy({pull_request:pr()},env,mock(pr(),{status:403}).request),/GitHub HTTP 403/);
  await assert.rejects(runPolicy({pull_request:pr()},{...env,GH_TOKEN:''}),/Contexto inválido/);
});
test('closed PR cannot be approved by a stale run',async()=>{
  assert.ok((await evaluate({...pr(),state:'closed'})).errors.some(e=>e.includes('não está aberto')));
});
test('workflow retains full quality, secrets and current PR events without target-token escalation',()=>{
  const yaml=fs.readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
  for(const command of ['npm run typecheck','npm run lint','npm test','npm run check:secrets','npm run bundle','node scripts/check-pr.mjs'])assert.ok(yaml.includes(command),command);
  assert.match(yaml,/opened, synchronize, reopened, edited/);assert.equal(yaml.includes('pull_request_target:'),false);
});
