import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluatePullRequest, snapshotErrors } from './pr-policy.mjs';
export async function runPolicy(event,env,request=fetch) {
  const repository=env.GITHUB_REPOSITORY;
  if(repository!=='gabrielmilagresdev/HomeCare-Grid'||!event.pull_request||!env.GH_TOKEN)throw new Error('Contexto inválido: PR HomeCare-Grid e token somente leitura obrigatórios.');
  const eventPr=event.pull_request;
  if(!Number.isSafeInteger(eventPr.number)||!/^[a-f0-9]{40}$/.test(eventPr.head?.sha??''))throw new Error('Evento de PR inválido.');
  async function get(resource) {
    const response=await request('https://api.github.com/repos/'+repository+'/'+resource,{headers:{Authorization:'Bearer '+env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('GitHub HTTP '+response.status+'; validação bloqueada.');
    return response.json();
  }
  const pr=await get('pulls/'+eventPr.number),stale=snapshotErrors(pr,eventPr);
  if(stale.length)throw new Error(stale.join('\n'));
  const result=await evaluatePullRequest({pr,eventPr,repository,readIssue:n=>get('issues/'+n)});
  if(result.errors.length)throw new Error(result.errors.join('\n'));
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {const result=await runPolicy(JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')),process.env);console.log('Rastreabilidade técnica aprovada: Issue #'+result.issueNumber+'. Merge exige revisão do árbitro e quality/pr-policy no SHA atual.');}
  catch(error){console.error(error.message);process.exitCode=1;}
}
