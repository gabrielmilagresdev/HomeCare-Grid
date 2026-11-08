import fs from 'node:fs';
const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
const pr=event.pull_request;const repo=process.env.GITHUB_REPOSITORY;
if(!pr||!repo||!process.env.GH_TOKEN)throw new Error('Contexto de PR ausente');
const refs=[...(pr.body??'').matchAll(/(?:Refs|Closes|Fixes|Related to)\s+#(\d+)/gi)].map(m=>Number(m[1]));
if(!refs.length)throw new Error('PR deve vincular Issue via Refs #numero.');
async function readIssue(number){const r=await fetch('https://api.github.com/repos/'+repo+'/issues/'+number,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('Issue inacessível '+number);return r.json();}
for(const number of new Set(refs)){
  const issue=await readIssue(number);if(issue.pull_request)throw new Error('Referência deve ser Issue, não PR');
  const isBootstrap=number===2&&pr.head.ref==='chore/2-bootstrap-foundation'&&pr.base.ref==='develop';
  if(isBootstrap)continue;
  if(issue.labels.some(l=>['status:blocked','status:backlog'].includes(l.name)))throw new Error('Issue não pronta: '+number);
  for(const match of (issue.body??'').matchAll(/Blocked by #(\d+)/g)){const dep=await readIssue(Number(match[1]));if(dep.state!=='closed'||!dep.labels.some(l=>l.name==='integration:verified'))throw new Error('Dependência não integrada/validada: '+dep.number);}
}
console.log('Issues vinculadas e dependências conferidas. Revisão independente ainda é requisito externo.');
