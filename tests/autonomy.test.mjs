import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { LeaseStore } from '../scripts/autonomy/store.mjs';
import { ACTORS, READINESS_GATES, withinScope, resourcesFor, eligible, readiness, validProtection, validExclusiveRule, independentHumanApproval } from '../scripts/autonomy/policy.mjs';
import { Broker, authenticate, validateSecrets, serve } from '../scripts/autonomy/broker.mjs';
import { GitHub } from '../scripts/autonomy/github.mjs';
import { boundedProcess, redact } from '../scripts/autonomy/process.mjs';
import { containerArgs, runOperational, collectChanges } from '../scripts/autonomy/controller.mjs';
import { prepareSnapshot } from '../scripts/autonomy/prepare.mjs';
import { init, verify, configErrors } from '../scripts/autonomy/cli.mjs';
const tempRoot=await fs.realpath(os.tmpdir());
async function temp(t) {const dir=await fs.mkdtemp(path.join(tempRoot,'hcg-autonomy-'));t.after(async()=>{assert.ok(path.resolve(dir).startsWith(tempRoot+path.sep+'hcg-autonomy-'));await fs.rm(dir,{recursive:true,force:true});});return dir;}
function store(t,opts={}) {const s=new LeaseStore(':memory:',opts);t.after(()=>s.close());return s;}
function rule() {return {enforcement:'active',bypass_actors:[],current_user_can_bypass:'never',conditions:{ref_name:{include:['refs/heads/main','refs/heads/develop'],exclude:[]}},rules:[
  {type:'deletion'},{type:'non_fast_forward'},
  {type:'pull_request',parameters:{required_approving_review_count:1,dismiss_stale_reviews_on_push:true,require_last_push_approval:true,required_review_thread_resolution:true,require_code_owner_review:true}},
  {type:'required_status_checks',parameters:{strict_required_status_checks_policy:true,required_status_checks:[{context:'quality',integration_id:15368},{context:'pr-policy',integration_id:15368}]}}
]};}
function exclusive() {return {enforcement:'active',conditions:rule().conditions,rules:[{type:'update'}],bypass_actors:[{actor_type:'Integration',actor_id:999,bypass_mode:'pull_request'}]};}
const actors=ACTORS.map((id,i)=>({id,githubLogin:'actor-'+i,humanLogin:id.split('-')[0],githubTokenEnv:'TOKEN_'+i}));
const secrets=Object.fromEntries(ACTORS.map((id,i)=>[id,{control:('control-'+i).padEnd(40,'c'),model:('model-'+i).padEnd(40,'m')}]));
const completed=n=>({number:n,state:'closed',state_reason:'completed',labels:[{name:'integration:verified'}]});
function fixture(t) {
  const s=store(t),config={repository:'gabrielmilagresdev/HomeCare-Grid',rulesetId:26781801,exclusiveRulesetId:99,arbiterAppId:999,leaseSeconds:180,model:'test-model',modelMaxRequests:2,actors,humanReviewers:['gabriel','lucas']};
  const calls=[],client={api:async resource=>{calls.push(resource);return resource.startsWith('git/ref/')?{object:{sha:'a'.repeat(40)}}:resource==='rulesets/99'?exclusive():rule();},issue:async n=>completed(n),merge:async()=>{calls.push('MERGED');return {merged:true};}};
  const evidence={expiresAt:Date.now()+60000,gates:Object.fromEntries(READINESS_GATES.map(g=>[g,true])),proofs:Object.fromEntries(READINESS_GATES.map(g=>[g,'https://example.invalid/proof/'+g]))};
  const context={baseSha:'a'.repeat(40),contracts:{plan:{stories:[]},map:{}},evidence,dockerAvailable:true,providerAvailable:true};
  return {s,config,client,calls,context,broker:new Broker({config,store:s,clients:Object.fromEntries(ACTORS.map(id=>[id,client])),secrets,context})};
}
test('two independent processes cannot claim the same Issue',async t=>{
  const dir=await temp(t),db=path.join(dir,'leases.sqlite');new LeaseStore(db).close();
  const moduleURL=new URL('../scripts/autonomy/store.mjs',import.meta.url).href;
  const code='import {LeaseStore} from '+JSON.stringify(moduleURL)+';const s=new LeaseStore(process.argv[1]);try{s.claim(10,process.argv[2],["path/a"],180000);console.log("CLAIMED")}catch{console.log("REJECTED")}finally{s.close()}';
  const run=actor=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,['--input-type=module','-e',code,db,actor],{windowsHide:true,stdio:['ignore','pipe','pipe']});let out='',err='';child.stdout.on('data',v=>out+=v);child.stderr.on('data',v=>err+=v);child.once('error',reject);child.once('close',c=>c===0?resolve(out.trim()):reject(new Error(err)));});
  assert.deepEqual((await Promise.all([run('a'),run('b')])).sort(),['CLAIMED','REJECTED']);
});
test('resource groups serialize package/lock and broad domain scopes',t=>{
  const s=store(t);s.claim(1,'a',resourcesFor(['package.json','src/**']));
  assert.throws(()=>s.claim(2,'b',resourcesFor(['package-lock.json'])),/conflict/);
  assert.throws(()=>s.claim(3,'c',resourcesFor(['src/services/contracts.ts'])),/conflict/);
  assert.doesNotThrow(()=>s.claim(4,'d',resourcesFor(['docs/demo/**'])));
});
test('path prefix and wildcard scopes cannot overlap silently',t=>{
  const s=store(t);s.claim(1,'a',resourcesFor(['scripts/check-*.mjs']));
  assert.throws(()=>s.claim(2,'b',resourcesFor(['scripts/check-new.mjs'])),/conflict/);
  assert.equal(withinScope('scripts/check-new.mjs',['scripts/check-*.mjs']),true);
  assert.equal(withinScope('scripts/deeper/check-new.mjs',['scripts/check-*.mjs']),false);
});
test('scope rejects traversal, Git metadata and symlinks during collection',async t=>{
  for(const file of ['../x','x/../y','/x','C:/x','.git/config','.GIT/config','x\\y'])assert.throws(()=>withinScope(file,['**']));
  assert.equal(withinScope('src/a.ts',['src/**']),true);assert.equal(withinScope('src2/a.ts',['src/**']),false);
  const dir=await temp(t);await fs.writeFile(path.join(dir,'a.txt'),'a');
  await assert.rejects(collectChanges(dir,['docs/**'],{processRunner:async()=>({ok:true,output:'?? a.txt\0'})}),/outside/);
});
test('expired lease retains locks until explicit stop/reconciliation',t=>{
  let now=0;const s=store(t,{clock:()=>now});const old=s.claim(1,'a',['path/shared'],1000);now=1001;
  assert.equal(s.status().leases[0].state,'quarantined');
  assert.throws(()=>s.claim(2,'b',['path/shared']),/conflict/);assert.throws(()=>s.assert(old),/Stale/);
  assert.throws(()=>s.recover(1,'admin',{executionStopped:true,reason:'stopped'}),/reconciliation/);
  s.recover(1,'admin',{executionStopped:true,remoteReconciled:true,reason:'container inspected and branch reconciled'});
  const next=s.claim(1,'a',['path/shared']);assert.ok(next.fence>old.fence);assert.throws(()=>s.assert(old),/Stale/);
});
test('cancellation does not free resources and attempt budget survives restart',async t=>{
  const dir=await temp(t),db=path.join(dir,'s.sqlite');let s=new LeaseStore(db);
  let lease=s.claim(1,'a',['path/a']);s.cancel(lease);assert.throws(()=>s.claim(2,'b',['path/a']),/conflict/);
  s.recover(1,'admin',{executionStopped:true,remoteReconciled:true,reason:'verified'});s.close();
  s=new LeaseStore(db);lease=s.claim(1,'a',['path/a']);s.cancel(lease);s.recover(1,'admin',{executionStopped:true,remoteReconciled:true,reason:'verified'});
  assert.throws(()=>s.claim(1,'a',['path/a']),/Attempt limit/);s.close();
});
test('review retains resources, limits resume, requires integration evidence',t=>{
  const s=store(t),first=s.claim(1,'a',['path/a']);s.review(first,8);
  assert.throws(()=>s.claim(2,'a',['path/b']),/already running/);assert.throws(()=>s.complete(1,'admin',{merged:true}),/evidence/);
  const second=s.resume(1,'a');assert.equal(second.pr,8);assert.throws(()=>s.assert(first),/Stale/);s.review(second,8);
  assert.throws(()=>s.resume(1,'a'),/limit/);s.complete(1,'admin',{merged:true,integrationVerified:true});
  assert.equal(s.status().resources.length,0);assert.ok(s.audit().some(e=>e.action==='complete'));
});
test('review analysis is bound to current SHA and expires',t=>{
  let now=0;const s=store(t,{clock:()=>now}),sha='a'.repeat(40);s.beginReview(8,sha,'lucas-arbiter');
  assert.throws(()=>s.decision(8,{sha:'b'.repeat(40),verdict:'APPROVED',analysis:'a'.repeat(50),findings:[]}),/stale/);
  s.decision(8,{sha,verdict:'APPROVED',analysis:'Reviewed all complete file content and test evidence.',findings:[]});
  assert.equal(s.approved(8,sha),true);assert.equal(s.approved(8,'b'.repeat(40)),false);now=5400001;assert.equal(s.approved(8,sha),false);
});
test('model quota is persistent and denied outside active sessions',t=>{
  const s=store(t),lease=s.claim(1,'a',['path/a']);assert.equal(s.modelRequest(lease,1),1);assert.throws(()=>s.modelRequest(lease,1),/limit/);
  s.cancel(lease);assert.throws(()=>s.modelRequest(lease),/Stale/);assert.throws(()=>s.reviewModel(),/Active/);
});
test('Ready requires owner, canonical scope and all integrated dependencies',async()=>{
  const actor=actors[0],issue={number:18,state:'open',body:'Blocked by #2',labels:['owner:gabriel','agent:operational','status:ready']};
  const plan={stories:[{id:'x',owner:'gabriel',role:'operational',files:['docs/**'],dependsOn:['BOOT']}]},map={x:{number:18},BOOT:{number:2}};
  assert.equal((await eligible(issue,actor,{plan,map,readIssue:async n=>completed(n)})).ready,true);
  assert.equal((await eligible(issue,actor,{plan,map,readIssue:async n=>({...completed(n),state_reason:'not_planned'})})).ready,false);
  const relabeled=structuredClone(issue);relabeled.labels=['owner:lucas','agent:operational','status:ready'];
  assert.equal((await eligible(relabeled,actors[1],{plan,map,readIssue:async n=>completed(n)})).ready,false);
  issue.labels.push('status:blocked');assert.equal((await eligible(issue,actor,{plan,map,readIssue:async n=>completed(n)})).ready,false);
});
test('native rule requires no bypass, strict current Actions checks and last-push review',()=>{
  const r=rule();assert.equal(validProtection(r),true);r.bypass_actors.push({actor_id:1});assert.equal(validProtection(r),false);
  const q=rule();q.rules[3].parameters.required_status_checks[0].integration_id=99;assert.equal(validProtection(q),false);
  const p=rule();p.rules[2].parameters.require_last_push_approval=false;assert.equal(validProtection(p),false);assert.equal(validProtection(null),false);
});
test('readiness fails closed for absent, expired or duplicated identity evidence',()=>{
  const base={rule:rule(),exclusiveRule:exclusive(),arbiterAppId:999,actors,foundation:true,dockerAvailable:true,evidence:{expiresAt:Date.now()+10000,gates:Object.fromEntries(READINESS_GATES.map(g=>[g,true]))}};
  assert.equal(readiness(base).ready,true);assert.equal(readiness({...base,foundation:false}).ready,false);
  assert.equal(readiness({...base,evidence:{gates:base.evidence.gates}}).ready,false);
  assert.equal(readiness({...base,actors:actors.map(a=>({...a,githubLogin:'same'}))}).ready,false);
});
test('Lucas operational needs an additional independent HUMAN at exact SHA',()=>{
  const sha='a'.repeat(40),pr={user:{login:'lucas-bot'},head:{sha}},actor={humanLogin:'Lucas-Phelipe'};
  const review=(login,type='User',commit_id=sha,state='APPROVED')=>({user:{login,type},commit_id,state});
  assert.equal(independentHumanApproval([review('Lucas-Phelipe')],pr,actor,['Lucas-Phelipe','gabriel']),false);
  assert.equal(independentHumanApproval([review('other-bot','Bot')],pr,actor,['other-bot']),false);
  assert.equal(independentHumanApproval([review('gabriel','User','b'.repeat(40))],pr,actor,['gabriel']),false);
  assert.equal(independentHumanApproval([review('gabriel')],pr,actor,['gabriel']),true);
  assert.equal(independentHumanApproval([review('gabriel'),review('gabriel','User',sha,'CHANGES_REQUESTED')],pr,actor,['gabriel']),false);
});
test('credentials are distinct and model credentials cannot authenticate control',()=>{
  validateSecrets(secrets);const copy=structuredClone(secrets);copy[ACTORS[1]].model=copy[ACTORS[0]].model;assert.throws(()=>validateSecrets(copy),/distinct/);
  assert.equal(authenticate(secrets[ACTORS[0]].model,secrets,'model'),ACTORS[0]);
  assert.throws(()=>authenticate(secrets[ACTORS[0]].model,secrets,'control'),/AUTHENTICATION/);
});
test('operator merge/inspection/admin decisions are rejected before any GitHub call',async t=>{
  const f=fixture(t);for(const operation of ['merge','inspect','decision'])await assert.rejects(f.broker.handle(ACTORS[0],operation,{pr:1}),/FORBIDDEN|ARBITER/);
  assert.deepEqual(f.calls,[]);
  const gh=new GitHub(actors[0],f.config,{request:async()=>{throw new Error('must not call');}});await assert.rejects(gh.merge(1,'a'.repeat(40),actors[0]),/FORBIDDEN/);
});
test('readiness failure blocks claim before reserving or changing Issue',async t=>{
  const f=fixture(t);f.context.evidence.gates.networkIsolation=false;
  await assert.rejects(f.broker.handle(ACTORS[0],'claim',{issue:18}),/NOT READY/);assert.equal(f.s.status().leases.length,0);
});
test('pilot bypass is limited to #58 and does not release general development',async t=>{
  const f=fixture(t);f.client.issue=async n=>n===2?{...completed(n),state:'open'}:completed(n);
  assert.equal((await f.broker.preflight()).ready,false);assert.equal((await f.broker.pilotcheck()).ready,true);
  await assert.rejects(f.broker.handle(ACTORS[1],'pilot',{issue:58}),/limited/);
  await assert.rejects(f.broker.handle(ACTORS[0],'claim',{issue:58}),/explicit/);
  const issue={number:58,state:'open',labels:[{name:'owner:gabriel'},{name:'agent:operational'},{name:'status:ready'}],body:'Blocked by #56'};
  const result=await f.broker.taskEligibility(issue,actors[0],['status:ready']);
  assert.deepEqual(result.scopes,['docs/audit/autonomy-pilot-result.md','tests/autonomy-pilot.test.mjs']);assert.equal(result.ready,true);
});
test('real loopback HTTP enforces model/control/admin boundaries',async t=>{
  const f=fixture(t),server=await serve(f.broker,{port:0,adminKey:'admin'.repeat(10)});t.after(()=>new Promise(resolve=>server.close(resolve)));
  const url='http://127.0.0.1:'+server.address().port;
  const post=(route,key,data={})=>fetch(url+route,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(data)});
  assert.equal((await post('/control/status',secrets[ACTORS[0]].model)).status,401);
  assert.equal((await post('/control/merge',secrets[ACTORS[0]].control,{pr:8})).status,403);
  assert.equal((await post('/admin/recover',secrets[ACTORS[0]].control,{issue:1})).status,401);
  assert.equal((await post('/v1/responses',secrets[ACTORS[0]].control)).status,401);
  assert.equal((await post('/v1/responses',secrets[ACTORS[0]].model,{model:'test-model'})).status,403);
  const response=await post('/control/status',secrets[ACTORS[0]].control);assert.equal(response.status,200);assert.deepEqual((await response.json()).leases,[]);
});
test('worker container exposes only model credential and dedicated task mounts',()=>{
  const args=containerArgs({actor:ACTORS[0],name:'hcg-gabriel-operational-1234',workspace:'/tasks/w',state:'/tasks/s',config:{workerImage:'trusted@sha256:'+ 'a'.repeat(64)},modelTokenFile:'/runtime/model',profileFile:'/runtime/profile',network:'hcg-workers'});
  const text=args.join(' ');assert.match(text,/--read-only/);assert.match(text,/--cap-drop=ALL/);assert.doesNotMatch(text,/docker.sock|\.ssh|GITHUB_TOKEN|HCG_GH_|--privileged|host/);
  assert.throws(()=>containerArgs({actor:ACTORS[0],name:'bad',network:'host'}),/boundary/);
});
test('failed preflight never creates workspace or launches worker',async t=>{
  const dir=await temp(t),commands=[];
  await assert.rejects(runOperational(ACTORS[0],18,{brokerUrl:'http://invalid',key:'unused',root:dir,config:{},processRunner:async(c,a)=>{commands.push([c,a]);return {ok:true};},request:async()=>new Response(JSON.stringify({ready:false,verdict:'NOT READY — BLOCKERS REMAIN',blockers:['pilot']}))}),/NOT READY/);
  assert.equal(commands.length,1);assert.equal(commands[0][1][0],'info');assert.deepEqual(await fs.readdir(dir),[]);
});
test('trusted snapshot rejects metadata paths and never passes personal credentials',async t=>{
  const dir=await temp(t),task={baseSha:'a'.repeat(40),lease:{issue:18}};
  await assert.rejects(prepareSnapshot(task,dir,{brokerUrl:'http://invalid',key:'control',request:async()=>new Response(JSON.stringify({ref:task.baseSha,files:[{path:'.git/config',mode:'100644',content:''}]}))}),/Unsafe/);
});
test('process timeout and cancellation terminate child and sanitize logs',async t=>{
  const dir=await temp(t),log=path.join(dir,'out.log'),secret='private-test-value-123456';
  const result=await boundedProcess(process.execPath,['-e','console.log(process.env.TEST_SECRET);setInterval(()=>{},1000)'],{env:{TEST_SECRET:secret},secretValues:[secret],timeoutMs:150,logFile:log});
  assert.equal(result.ok,false);assert.equal(result.reason,'timeout');assert.doesNotMatch(await fs.readFile(log,'utf8'),new RegExp(secret));
  const abort=new AbortController();setTimeout(()=>abort.abort(),100);
  const cancelled=await boundedProcess(process.execPath,['-e','setInterval(()=>{},1000)'],{signal:abort.signal,timeoutMs:10000});assert.equal(cancelled.reason,'cancelled');
  assert.equal(redact('token='+secret,[secret]),'token=[REDACTED]');
});
test('process output limit is bounded and child env excludes GitHub credentials',async()=>{
  const before=process.env.HCG_GH_TEST;process.env.HCG_GH_TEST='must-not-leak';
  try {const result=await boundedProcess(process.execPath,['-e','console.log(process.env.HCG_GH_TEST??"absent")'],{timeoutMs:10000});assert.equal(result.output.trim(),'absent');}
  finally {if(before===undefined)delete process.env.HCG_GH_TEST;else process.env.HCG_GH_TEST=before;}
  const limit=await boundedProcess(process.execPath,['-e','console.log("x".repeat(20000))'],{maxBytes:100,timeoutMs:10000});assert.equal(limit.reason,'output-limit');
});
test('runtime initialization is offline, isolated and refuses credential overwrite',async t=>{
  const root=path.join(await temp(t),'runtime');const result=await init(root);assert.equal(result.active,false);
  const config=JSON.parse(await fs.readFile(path.join(root,'config.json'),'utf8'));
  const checked=await verify(root,{processRunner:async()=>({ok:false})});assert.equal(checked.ready,false);assert.ok(checked.blockers.some(x=>x.includes('Docker')));
  assert.equal(config.actors.length,5);assert.equal(config.actors.at(-1).githubLogin,null);
  await assert.rejects(init(root),/overwrite/);
});

test('reserved task body and base SHA are immutable before publication',async t=>{
  const f=fixture(t),actor=actors[0];let issue={number:18,title:'Example',body:'Reviewed acceptance',state:'open',labels:[{name:'owner:gabriel'},{name:'agent:operational'},{name:'status:ready'}]};
  f.context.contracts={plan:{stories:[{id:'x',owner:'gabriel',role:'operational',files:['docs/**'],dependsOn:[]}]},map:{x:{number:18}}};
  f.client.issue=async n=>n===18?structuredClone(issue):completed(n);
  f.client.status=async(n,status)=>{issue.labels=issue.labels.filter(l=>!l.name.startsWith('status:'));issue.labels.push({name:'status:'+status});};
  let published=false;f.client.publish=async()=>{published=true;return {number:88};};
  const task=await f.broker.handle(actor.id,'claim',{issue:18});assert.equal(f.s.binding(task.lease).base_sha,'a'.repeat(40));
  issue.body+=' Changed after claim';
  await assert.rejects(f.broker.handle(actor.id,'publish',{lease:task.lease,files:[{path:'docs/a',content:'x'}]}),/Task changed/);assert.equal(published,false);
});
test('changed integration base invalidates readiness even with old successful evidence',async t=>{
  const f=fixture(t);assert.equal((await f.broker.preflight()).ready,true);
  f.client.api=async resource=>resource.startsWith('git/ref/')?{object:{sha:'b'.repeat(40)}}:resource==='rulesets/99'?exclusive():rule();
  assert.equal((await f.broker.preflight()).ready,false);assert.equal((await f.broker.pilotcheck()).ready,false);
});
function mergeFixture() {
  const config={repository:'gabrielmilagresdev/HomeCare-Grid',rulesetId:1,exclusiveRulesetId:99,arbiterAppId:999,humanReviewers:['gabriel']},author={id:'lucas-operational',githubLogin:'lucas-bot',humanLogin:'lucas'},gh=new GitHub({id:'lucas-arbiter',githubLogin:'arbiter-bot'},config);
  const pr={number:88,state:'open',draft:false,body:'Refs #99',user:{login:'lucas-bot'},head:{sha:'a'.repeat(40),ref:'feature/99-example'},base:{ref:'develop',sha:'b'.repeat(40)},mergeable_state:'clean'};
  const reviews=[{state:'APPROVED',commit_id:pr.head.sha,user:{login:'gabriel',type:'User'}}],checks=['quality','pr-policy'].map((name,i)=>({id:i+1,name,status:'completed',conclusion:'success',app:{id:15368}})),writes=[];
  gh.inspectPR=async()=>({pr,reviews});gh.contracts=async()=>({plan:{stories:[]},map:{}});
  gh.issue=async()=>({number:99,state:'open',body:'',labels:[{name:'agent:operational'},{name:'status:in-review'}]});
  gh.api=async(resource,options={})=>{if(options.method==='PUT'){writes.push(options);return {merged:true};}return resource==='rulesets/99'?exclusive():resource.startsWith('rulesets/')?rule():{check_runs:checks};};
  return {gh,pr,reviews,checks,writes,author};
}
test('arbiter rejects failed CI, stale human approval and changed SHA without writes',async()=>{
  const f=mergeFixture();f.checks[0].conclusion='failure';await assert.rejects(f.gh.merge(88,f.pr.head.sha,f.author),/checks/);assert.equal(f.writes.length,0);
  f.checks[0].conclusion='success';f.reviews[0].commit_id='c'.repeat(40);await assert.rejects(f.gh.merge(88,f.pr.head.sha,f.author),/HUMAN/);assert.equal(f.writes.length,0);
  await assert.rejects(f.gh.merge(88,'d'.repeat(40),f.author),/current/);assert.equal(f.writes.length,0);
});
test('arbiter merge uses exact SHA and never an admin/force bypass',async()=>{
  const f=mergeFixture();assert.equal((await f.gh.merge(88,f.pr.head.sha,f.author)).merged,true);assert.deepEqual(f.writes,[{method:'PUT',body:{sha:f.pr.head.sha,merge_method:'merge'}}]);
});
test('publisher rejects outside scope and wrong branch before GitHub writes',async()=>{
  const config={repository:'gabrielmilagresdev/HomeCare-Grid'},gh=new GitHub(actors[0],config,{request:async()=>{throw new Error('must not call');}});
  const input={lease:{issue:18,actor:ACTORS[0]},scopes:['docs/**'],files:[{path:'src/a.ts',content:'x'}],baseSha:'a'.repeat(40),branch:'feature/18-'+ACTORS[0],summary:'task'};
  await assert.rejects(gh.publish(input),/outside scope/);await assert.rejects(gh.publish({...input,branch:'develop'}),/ownership/);
});

test('exclusive update rule permits only arbiter App through PR, without bypassing review rules',()=>{
  assert.equal(validExclusiveRule(exclusive(),999),true);
  const r=exclusive();r.bypass_actors[0].bypass_mode='always';assert.equal(validExclusiveRule(r,999),false);
  const s=exclusive();s.bypass_actors.push({actor_type:'RepositoryRole',actor_id:5,bypass_mode:'always'});assert.equal(validExclusiveRule(s,999),false);
  assert.equal(validExclusiveRule(exclusive(),1000),false);assert.equal(validExclusiveRule(null,999),false);
});

test('binary/non-UTF-8 files are never silently converted by publisher',async t=>{
  const dir=await temp(t),file=path.join(dir,'a.txt'),runner=async()=>({ok:true,output:'?? a.txt\0'});
  await fs.writeFile(file,new Uint8Array([65,0,66]));await assert.rejects(collectChanges(dir,['a.txt'],{processRunner:runner}),/Binary/);
  await fs.writeFile(file,new Uint8Array([255,254,253]));await assert.rejects(collectChanges(dir,['a.txt'],{processRunner:runner}),/UTF-8/);
});
test('trusted configuration rejects unknown actors and unbounded retries/time',async()=>{
  const config=JSON.parse(await fs.readFile(new URL('../infra/autonomy/config.example.json',import.meta.url),'utf8'));assert.deepEqual(configErrors(config),[]);
  config.maxAttempts=999;assert.ok(configErrors(config).length);config.maxAttempts=2;config.maxRunSeconds=99999;assert.ok(configErrors(config).length);
  config.maxRunSeconds=5400;config.actors[0].id='untrusted';assert.ok(configErrors(config).length);
});
