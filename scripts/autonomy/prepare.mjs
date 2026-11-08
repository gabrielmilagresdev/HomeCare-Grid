import fs from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { control } from './controller.mjs';
import { cleanPath } from './policy.mjs';
import { boundedProcess } from './process.mjs';
export async function prepareSnapshot(task,workspace,{brokerUrl,key,config,signal,request=fetch,processRunner=boundedProcess}={}) {
  const snapshot=await control(brokerUrl,key,'snapshot',{lease:task.lease},request);
  if(snapshot.ref!==task.baseSha||!Array.isArray(snapshot.files))throw new Error('Snapshot base mismatch');
  await fs.mkdir(workspace,{recursive:true});
  for(const file of snapshot.files) {
    cleanPath(file.path);if(!['100644','100755'].includes(file.mode))throw new Error('Unsupported snapshot mode');
    const dest=path.join(workspace,file.path);await fs.mkdir(path.dirname(dest),{recursive:true});
    await fs.writeFile(dest,Buffer.from(file.content,'base64'),{mode:file.mode==='100755'?0o755:0o644});
  }
  for(const args of [['init'],['add','--all'],['-c','user.name=HomeCare snapshot','-c','user.email=snapshot@invalid','-c','commit.gpgsign=false','commit','-m','Trusted immutable snapshot '+task.baseSha]]) {
    const result=await processRunner('git',args,{cwd:workspace,timeoutMs:60000,signal});
    if(!result.ok)throw new Error('Local snapshot initialization failed');
  }
  // Synthetic local commit is only a diff baseline. Publication always parents the real remote baseSha.
  // Dependency installation is a separate trusted preparation container; no GitHub/model credentials mounted.
  const install=await processRunner('docker',['run','--rm','--read-only','--cap-drop=ALL','--security-opt=no-new-privileges','--pids-limit=256','--memory=3g','--cpus=2','--user=1000:1000',
    '--network','hcg-build','--mount','type=bind,src='+workspace+',dst=/workspace','--tmpfs','/tmp:rw,nosuid,size=1g','--env','HOME=/tmp','--env','npm_config_cache=/tmp/npm',
    '--entrypoint','node',config.workerImage,'/usr/local/lib/node_modules/npm/bin/npm-cli.js','ci'],{timeoutMs:600000,signal});
  if(!install.ok)throw new Error('Trusted dependency preparation failed');
}
