import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import { ACTORS, READINESS_GATES } from './policy.mjs';
import { LeaseStore } from './store.mjs';
import { GitHub } from './github.mjs';
import { Broker, serve } from './broker.mjs';
import { control, runOperational, runArbiter } from './controller.mjs';
import { prepareSnapshot } from './prepare.mjs';
import { boundedProcess } from './process.mjs';
export const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const readJSON=async file=>JSON.parse(await fs.readFile(file,'utf8'));
export async function init(root) {
  await fs.mkdir(root,{recursive:true});
  const configFile=path.join(root,'config.json');
  try {await fs.access(configFile);throw new Error('Runtime already initialized; refusing credential overwrite');}catch(error){if(error.code!=='ENOENT')throw error;}
  const source=new URL('../../infra/autonomy/config.example.json',import.meta.url);
  const config=await readJSON(source);
  await fs.writeFile(configFile,JSON.stringify(config,null,2)+'\n',{mode:0o600,flag:'wx'});
  const secrets={};await fs.mkdir(path.join(root,'secrets'),{recursive:true});await fs.mkdir(path.join(root,'profiles'),{recursive:true});
  for(const actor of ACTORS) {
    secrets[actor]={control:randomBytes(32).toString('hex'),model:randomBytes(32).toString('hex')};
    await fs.mkdir(path.join(root,actor),{recursive:true});
    await fs.writeFile(path.join(root,'secrets',actor+'.model'),secrets[actor].model,{mode:0o600,flag:'wx'});
  }
  await fs.writeFile(path.join(root,'secrets.json'),JSON.stringify({actors:secrets,admin:randomBytes(32).toString('hex')},null,2),{mode:0o600,flag:'wx'});
  await fs.writeFile(path.join(root,'evidence.json'),JSON.stringify({expiresAt:0,configDigest:null,baseSha:null,gates:Object.fromEntries(READINESS_GATES.map(k=>[k,false])),proofs:{}},null,2)+'\n',{mode:0o600,flag:'wx'});
  await profiles(root,config);
  return {initialized:root,actors:ACTORS,active:false,verdict:'NOT READY — BLOCKERS REMAIN'};
}
export async function profiles(root,config) {
  const model=JSON.stringify(config.model??'UNCONFIGURED');
  for(const actor of ACTORS) {
    const text='model = '+model+'\nmodel_provider = "homecare_broker"\napproval_policy = "never"\nsandbox_mode = "workspace-write"\n[sandbox_workspace_write]\nnetwork_access = false\n[model_providers.homecare_broker]\nname = "HomeCare trusted broker"\nbase_url = "http://broker:8080/v1"\nenv_key = "HCG_MODEL_TOKEN"\nwire_api = "responses"\n';
    await fs.writeFile(path.join(root,'profiles',actor+'.toml'),text,{mode:0o600});
  }
}
export function configErrors(config) {
  const errors=[];
  if(config.schema!==1||config.repository!=='gabrielmilagresdev/HomeCare-Grid'||config.baseBranch!=='develop')errors.push('Unsupported repository/configuration');
  if(!Array.isArray(config.actors)||config.actors.length!==5||ACTORS.some(id=>config.actors.filter(a=>a.id===id).length!==1))errors.push('Exactly five known actor IDs required');
  if(!Number.isSafeInteger(config.maxAttempts)||config.maxAttempts<1||config.maxAttempts>2||!Number.isSafeInteger(config.maxRunSeconds)||config.maxRunSeconds<1||config.maxRunSeconds>5400||!Number.isSafeInteger(config.leaseSeconds)||config.leaseSeconds<3||config.leaseSeconds>300||!Number.isSafeInteger(config.modelMaxRequests)||config.modelMaxRequests<1||config.modelMaxRequests>60)errors.push('Execution/lease/model budgets outside allowed bounds');
  return errors;
}
export async function verify(root,{processRunner=boundedProcess}={}) {
  const config=await readJSON(path.join(root,'config.json')),blockers=configErrors(config);
  if(config.repository!=='gabrielmilagresdev/HomeCare-Grid')blockers.push('Repository mismatch');
  if(config.actors.length!==5||new Set(config.actors.map(a=>a.id)).size!==5||ACTORS.some(id=>!config.actors.some(a=>a.id===id)))blockers.push('Five known actor IDs required');
  if(new Set(config.actors.map(a=>a.githubLogin).filter(Boolean)).size!==5)blockers.push('Five distinct GitHub identities missing');
  if(!/^.+@sha256:[a-f0-9]{64}$/.test(config.workerImage??''))blockers.push('Trusted worker image digest not pinned/built');
  if(!config.model)blockers.push('Model/provider not configured');
  const docker=await processRunner('docker',['info','--format','{{.ServerVersion}}'],{timeoutMs:15000}).catch(()=>({ok:false}));
  if(!docker.ok)blockers.push('Docker daemon unavailable');
  const evidence=await readJSON(path.join(root,'evidence.json'));
  if(!Number.isFinite(evidence.expiresAt)||evidence.expiresAt<=Date.now())blockers.push('Pilot evidence absent/expired');
  for(const gate of READINESS_GATES)if(evidence.gates?.[gate]!==true||!evidence.proofs?.[gate])blockers.push('Unproven gate: '+gate);
  if(evidence.configDigest!==digest(config))blockers.push('Evidence is not bound to current configuration');
  return {ready:false,verdict:'NOT READY — BLOCKERS REMAIN',blockers: [...blockers,'Native protection, current foundation acceptance and actual identities require broker preflight'],dockerAvailable:docker.ok,config};
}
export async function startBroker(root) {
  const checked=await verify(root),config=checked.config;
  const invalid=configErrors(config);if(invalid.length)throw new Error(invalid.join('; '));
  const secrets=await readJSON(path.join(root,'secrets.json')),clients={},identities=[];
  for(const actor of config.actors) {
    if(!actor.githubLogin)throw new Error('Unprovisioned identity: '+actor.id);
    const client=new GitHub(actor,config);clients[actor.id]=client;identities.push(await client.identity());
  }
  if(new Set(identities.map(i=>i.login)).size!==5)throw new Error('GitHub identities are not distinct');
  const tokenValues=await Promise.all(Object.values(clients).map(client=>client.token()));
  if(new Set(tokenValues).size!==5)throw new Error('GitHub credentials are not distinct');
  const reference=await clients['lucas-arbiter'].api('git/ref/heads/'+config.baseBranch),baseSha=reference.object.sha;
  const contracts=await clients['lucas-arbiter'].contracts(baseSha),evidence=await readJSON(path.join(root,'evidence.json'));
  // Evidence is operator-inaccessible, bound to this config/base and must carry actual external proof references.
  if(!/^.+@sha256:[a-f0-9]{64}$/.test(config.workerImage??'')||evidence.configDigest!==digest(config)||evidence.baseSha!==baseSha||identities.some(i=>i.requiresPublicationProof&&!evidence.proofs?.credentials))evidence.gates={};
  for(const gate of READINESS_GATES)if(!evidence.proofs?.[gate])evidence.gates[gate]=false;
  const store=new LeaseStore(path.join(root,'leases.sqlite'),{maxAttempts:config.maxAttempts});
  const broker=new Broker({config,store,clients,secrets:secrets.actors,context:{baseSha,contracts,evidence,dockerAvailable:checked.dockerAvailable||evidence.gates.isolatedContainers===true,providerAvailable:Boolean(process.env.HCG_OPENAI_KEY&&config.model)}});
  const server=await serve(broker,{host:process.env.HCG_BIND??'127.0.0.1',port:Number(process.env.HCG_PORT??8080),openaiKey:process.env.HCG_OPENAI_KEY,adminKey:secrets.admin});
  const stop=()=>server.close(()=>{store.close();process.exitCode=0;});process.once('SIGINT',stop);process.once('SIGTERM',stop);
  return {listening:server.address(),activeWorkers:0};
}
export async function stopAll(root,{processRunner=boundedProcess}={}) {
  const stopped=[];
  for(const actor of ACTORS) {
    let entries;try{entries=await fs.readdir(path.join(root,actor),{withFileTypes:true});}catch{continue;}
    for(const entry of entries) {
      if(!entry.isDirectory())continue;
      try {
        const file=path.join(root,actor,entry.name,'checkpoint.json'),record=await readJSON(file);
        if(!record.container||!/^hcg-[a-z-]+-[a-f0-9-]+$/.test(record.container))continue;
        const result=await processRunner('docker',['stop','--time','10',record.container],{timeoutMs:30000});
        stopped.push({container:record.container,stopped:result.ok});
      }catch(error){stopped.push({actor,error:error.message});}
    }
  }
  return {stopped,notice:'Reservations stay quarantined/cancelled; reconcile remote state before admin recovery.'};
}
export async function main(args=process.argv.slice(2)) {
  const [command,rootArg,actorOrIssue,numberOrSha]=args;
  if(command==='help'||!command)return {usage:'node scripts/autonomy/cli.mjs <init|profiles|verify|dry-run|serve|preflight|tasks|start|resume|pilot|queue|arbiter|ready|merge|status|stop|recover|complete> <runtime-root> [actor|pr|issue] [issue|sha]',notice:'Trusted coordinator console only. Runtime root must be dedicated and excluded from Git.'};
  if(!rootArg)throw new Error('Dedicated runtime root required');
  const root=path.resolve(rootArg);
  if(command==='init')return init(root);
  if(command==='verify'||command==='dry-run')return verify(root);
  if(command==='stop')return stopAll(root);
  if(command==='serve')return startBroker(root);
  const config=await readJSON(path.join(root,'config.json'));
  if(command==='profiles'){await profiles(root,config);return {updated:true,active:false};}
  const secrets=await readJSON(path.join(root,'secrets.json')),brokerUrl=process.env.HCG_BROKER_URL??'http://127.0.0.1:8080';
  if(command==='recover'||command==='complete') {
    const issue=Number(actorOrIssue);if(!Number.isSafeInteger(issue)||issue<1)throw new Error('Issue required');
    let data={issue};
    if(command==='recover') {
      // Explicit admin attestation is a file, never inferred from an expired timer.
      if(!numberOrSha)throw new Error('Recovery requires a reconciliation JSON file');
      data={...await readJSON(path.resolve(numberOrSha)),issue};
    }
    const response=await fetch(brokerUrl+'/admin/'+command,{method:'POST',headers:{Authorization:'Bearer '+secrets.admin,'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(30000)});
    const result=await response.json();if(!response.ok)throw new Error(result.error);return result;
  }
  if(command==='arbiter'){const queue=actorOrIssue?null:await control(brokerUrl,secrets.actors['lucas-arbiter'].control,'queue');if(queue&&!queue.length)return {idle:true,reason:'No eligible PR awaiting review'};return runArbiter(actorOrIssue?Number(actorOrIssue):queue[0].number,{brokerUrl,key:secrets.actors['lucas-arbiter'].control,root,config});}
  if(command==='merge')return control(brokerUrl,secrets.actors['lucas-arbiter'].control,'merge',{pr:Number(actorOrIssue),sha:numberOrSha});
  const actor=command==='pilot'?'gabriel-operational':actorOrIssue??'lucas-arbiter';if(!ACTORS.includes(actor))throw new Error('Unknown actor');
  const key=secrets.actors[actor].control;
  if(command==='ready')return control(brokerUrl,key,'ready',{issue:Number(numberOrSha)});
  if(command==='start'&&!numberOrSha){const tasks=await control(brokerUrl,key,'tasks');if(!tasks.length)return {idle:true,reason:'No Ready Issue with integrated dependencies'};return runOperational(actor,tasks[0].number,{brokerUrl,key,root,config,prepareWorkspace:(task,workspace,signal)=>prepareSnapshot(task,workspace,{brokerUrl,key,config,signal})});}
  if(['start','resume','pilot'].includes(command))return runOperational(actor,command==='pilot'?58:Number(numberOrSha),{pilot:command==='pilot'||Number(numberOrSha)===58,resume:command==='resume',brokerUrl,key,root,config,prepareWorkspace:(task,workspace,signal)=>prepareSnapshot(task,workspace,{brokerUrl,key,config,signal})});
  if(['preflight','tasks','status','queue'].includes(command))return control(brokerUrl,key,command,{});
  throw new Error('Unknown command');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {const result=await main();console.log(JSON.stringify(result,null,2));if(result?.ready===false)process.exitCode=2;}
  catch(error){console.error(JSON.stringify({error:error.message,verdict:'NOT READY — BLOCKERS REMAIN'}));process.exitCode=1;}
}
