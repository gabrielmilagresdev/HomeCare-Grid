import fs from 'node:fs';
import {validatePlan,issueBody} from './backlog-lib.mjs';
const plan=JSON.parse(fs.readFileSync('docs/agile/backlog.json','utf8'));validatePlan(plan);
const map=JSON.parse(fs.readFileSync('docs/agile/github-map.json','utf8'));
if(!process.argv.includes('--apply')){console.log(JSON.stringify({mode:'dry-run',epics:plan.epics.length,stories:plan.stories.length,existing:Object.keys(map).length,action:'Reconciliar corpos de Issues existentes; sem merge, fechamento ou alteração de credenciais.'},null,2));}
else {
  if(!process.env.GH_TOKEN)throw new Error('GH_TOKEN efêmero deve ser injetado externamente; não ler credenciais pessoais.');
  for(const story of plan.stories){
    const entry=map[story.id];if(!entry)throw new Error('Issue sem mapeamento: '+story.id);
    const response=await fetch('https://api.github.com/repos/'+plan.repository+'/issues/'+entry.number,{method:'PATCH',headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify({body:issueBody(story,plan,map)}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('GitHub '+response.status+' na Issue '+entry.number+'; interrompido sem retry.');
    console.log('Atualizada Issue #'+entry.number);
  }
}
