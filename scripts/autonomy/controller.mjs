import { TextDecoder } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { boundedProcess, checkpoint } from './process.mjs';
import { ACTORS, cleanPath, withinScope } from './policy.mjs';
export async function control(url,key,operation,data={},request=fetch) {
  const response=await request(url+'/control/'+operation,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(operation==='snapshot'?180000:30000)});
  const result=await response.json();if(!response.ok)throw new Error(result.error??'Broker unavailable');return result;
}
export function containerArgs({actor,name,workspace,state,config,modelTokenFile,profileFile,network}) {
  if(!ACTORS.includes(actor)||!/^hcg-[a-z-]+-[a-f0-9-]+$/.test(name)||network!=='hcg-workers')throw new Error('Container boundary invalid');
  return ['run','--rm','--name',name,'--network',network,'--read-only','--cap-drop=ALL','--security-opt=no-new-privileges','--pids-limit=256','--memory=3g','--cpus=2','--user=1000:1000',
    '--mount','type=bind,src='+workspace+',dst=/workspace','--mount','type=bind,src='+state+',dst=/state',
    '--mount','type=bind,src='+profileFile+',dst=/state/codex/config.toml,readonly',
    '--mount','type=bind,src='+modelTokenFile+',dst=/run/secrets/model-token,readonly',
    '--tmpfs','/tmp:rw,noexec,nosuid,size=512m','--env','HCG_ACTOR='+actor,config.workerImage];
}
export async function collectChanges(workspace,scopes,{processRunner=boundedProcess}={}) {
  const git=await processRunner('git',['status','--porcelain=v1','-z','--untracked-files=all'],{cwd:workspace,timeoutMs:30000});
  if(!git.ok)throw new Error('Cannot inspect task diff');
  const result=[];
  for(const item of git.output.split('\0').filter(Boolean)) {
    const status=item.slice(0,2),file=item.slice(3);cleanPath(file);
    if(status.includes('R')||status.includes('C')||status.includes('D'))throw new Error('Renames/deletions require explicit manual review before publishing');
    if(!withinScope(file,scopes))throw new Error('Change outside reserved Issue scope: '+file);
    const real=await fs.realpath(path.join(workspace,file)),root=await fs.realpath(workspace);
    if(!real.startsWith(root+path.sep)||(await fs.lstat(path.join(workspace,file))).isSymbolicLink())throw new Error('Symlink/outside workspace');
    const bytes=await fs.readFile(real);if(bytes.includes(0))throw new Error('Binary files require manual publication');
    let content;try{content=new TextDecoder('utf8',{fatal:true}).decode(bytes);}catch{throw new Error('Non-UTF-8 files require manual publication');}
    result.push({path:file,content,mode:'100644'});
  }
  return result;
}
export async function runOperational(actor,issue,{brokerUrl,key,root,config,prepareWorkspace,processRunner=boundedProcess,request=fetch,pilot=false,resume=false}={}) {
  if(!ACTORS.includes(actor)||actor==='lucas-arbiter')throw new Error('Operational actor required');
  const docker=await processRunner('docker',['info','--format','{{.ServerVersion}}'],{timeoutMs:15000});if(!docker.ok)throw new Error('Docker daemon unavailable');
  const preflight=await control(brokerUrl,key,pilot?'pilotcheck':'preflight',{},request);if(!preflight.ready)throw new Error(preflight.verdict+': '+preflight.blockers.join('; '));
  const task=await control(brokerUrl,key,resume?'resume':pilot?'pilot':'claim',{issue},request),lease=task.lease;
  const directory=path.join(root,actor,lease.id),workspace=path.join(directory,'workspace'),state=path.join(directory,'state');
  await fs.mkdir(state,{recursive:true});await fs.mkdir(path.join(state,'codex'),{recursive:true});
  task.maxRunSeconds=config.maxRunSeconds;await fs.writeFile(path.join(state,'task.json'),JSON.stringify(task),{mode:0o600});
  const deadline=Date.now()+config.maxRunSeconds*1000;
  const name='hcg-'+actor+'-'+lease.id;
  await checkpoint(directory,{phase:'preparing',lease,container:name});
  const abort=new AbortController();
  const heartbeat=setInterval(()=>{control(brokerUrl,key,'renew',{lease},request).catch(()=>abort.abort());},Math.floor(config.leaseSeconds*1000/3));
  try {
    // Trusted preparation hook runs outside the worker, with only the intended repo and no personal credentials.
    if(typeof prepareWorkspace!=='function')throw new Error('Trusted workspace preparer not configured');
    await prepareWorkspace(task,workspace,abort.signal);
    if(abort.signal.aborted)throw new Error('Lease lost during preparation');
    task.maxRunSeconds=Math.floor((deadline-Date.now())/1000);
    if(task.maxRunSeconds<1)throw new Error('Task time budget exhausted in preparation');
    await fs.writeFile(path.join(state,'task.json'),JSON.stringify(task),{mode:0o600});
    const args=containerArgs({actor,name,workspace,state,config,network:'hcg-workers',modelTokenFile:path.join(root,'secrets',actor+'.model'),profileFile:path.join(root,'profiles',actor+'.toml')});
    const run=await processRunner('docker',args,{timeoutMs:task.maxRunSeconds*1000,maxBytes:10485760,signal:abort.signal,logFile:path.join(directory,'container.log')});
    if(!run.ok)throw new Error('Isolated worker failed: '+(run.reason??run.exitCode));
    const marker=JSON.parse(await fs.readFile(path.join(state,'checkpoint.json'),'utf8'));
    if(marker.phase!=='verified'||marker.lease.id!==lease.id)throw new Error('Worker verification checkpoint missing');
    const files=await collectChanges(workspace,task.scopes,{processRunner});
    const published=await control(brokerUrl,key,'publish',{lease,files,summary:task.issue.title},request);
    await checkpoint(directory,{phase:'in-review',lease,published});return published;
  } catch(error) {
    // A stopped docker CLI is not proof the daemon stopped its container.
    await processRunner('docker',['stop','--time','10',name],{timeoutMs:30000}).catch(()=>{});
    await control(brokerUrl,key,'cancel',{lease},request).catch(()=>{});
    await checkpoint(directory,{phase:'blocked',lease,container:name,reason:error.message});
    throw error;
  } finally {clearInterval(heartbeat);}
}

export async function runArbiter(pr,{brokerUrl,key,root,config,processRunner=boundedProcess,request=fetch}={}) {
  const packet=await control(brokerUrl,key,'inspect',{pr},request);
  const actor='lucas-arbiter',directory=path.join(root,actor,'review-'+pr+'-'+packet.pr.head.sha),workspace=path.join(directory,'workspace'),state=path.join(directory,'state');
  await fs.mkdir(workspace,{recursive:true});await fs.mkdir(path.join(state,'codex'),{recursive:true});
  await fs.writeFile(path.join(state,'review.json'),JSON.stringify(packet),{mode:0o600});
  await fs.writeFile(path.join(state,'task.json'),JSON.stringify({mode:'arbiter'}),{mode:0o600});
  const name='hcg-'+actor+'-'+packet.pr.head.sha;
  await checkpoint(directory,{phase:'reviewing',container:name,sha:packet.pr.head.sha});
  const args=containerArgs({actor,name,workspace,state,config,network:'hcg-workers',modelTokenFile:path.join(root,'secrets',actor+'.model'),profileFile:path.join(root,'profiles',actor+'.toml')});
  try {
    const run=await processRunner('docker',args,{timeoutMs:5400000,logFile:path.join(directory,'container.log')});
    if(!run.ok)throw new Error('Arbiter container failed');
    const result=JSON.parse(await fs.readFile(path.join(state,'result.json'),'utf8'));
    return control(brokerUrl,key,'decision',{pr,result},request);
  } finally {await processRunner('docker',['stop','--time','10',name],{timeoutMs:30000}).catch(()=>{});}
}
