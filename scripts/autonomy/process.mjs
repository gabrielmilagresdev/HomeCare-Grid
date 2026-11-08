import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
export function redact(text,secrets=[]) {
  let value=String(text);for(const secret of secrets.filter(Boolean))value=value.split(secret).join('[REDACTED]');
  return value.replace(/(?:gh[pousr]_|github_pat_|sk-proj-)[A-Za-z0-9_-]{16,}/g,'[REDACTED]');
}
export async function checkpoint(directory,data) {
  await fs.mkdir(directory,{recursive:true});const dest=path.join(directory,'checkpoint.json'),temp=dest+'.'+randomUUID()+'.tmp';
  await fs.writeFile(temp,JSON.stringify(data,null,2)+'\n',{mode:0o600});await fs.rename(temp,dest);
}
export async function boundedProcess(command,args,{cwd,env={},timeoutMs=5400000,maxBytes=10485760,logFile,secretValues=[],signal}={}) {
  if(timeoutMs<10||timeoutMs>5400000)throw new Error('Invalid process timeout');
  if(!Array.isArray(args)||args.some(v=>typeof v!=='string'))throw new Error('Invalid argument vector');
  const child=spawn(command,args,{cwd,env:{PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,TEMP:process.env.TEMP,TMP:process.env.TMP,...env},shell:false,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output='',bytes=0,reason=null,force;
  const stop=why=>{if(reason)return;reason=why;child.kill('SIGTERM');force=setTimeout(()=>child.kill('SIGKILL'),5000);};
  const onAbort=()=>stop('cancelled');
  if(signal?.aborted)onAbort();else signal?.addEventListener('abort',onAbort,{once:true});
  const timer=setTimeout(()=>stop('timeout'),timeoutMs);
  const consume=chunk=>{bytes+=chunk.length;if(bytes>maxBytes){stop('output-limit');return;}output+=chunk;};
  child.stdout.on('data',consume);child.stderr.on('data',consume);
  let exitCode;try{exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve);});}
  finally{clearTimeout(timer);clearTimeout(force);signal?.removeEventListener('abort',onAbort);}
  const safe=redact(output,secretValues);
  if(logFile){await fs.mkdir(path.dirname(logFile),{recursive:true});await fs.writeFile(logFile,safe,{mode:0o600});}
  return {ok:exitCode===0&&!reason,exitCode,reason,output:safe};
}
