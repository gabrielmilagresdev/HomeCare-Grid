export const ROLES = ['lucas-operational', 'lucas-arbiter'];
export const ASSIGNMENT_START = '<!-- hcg:dual-agent-assignment:start -->';
export const ASSIGNMENT_END = '<!-- hcg:dual-agent-assignment:end -->';
export function executorFor(story, mode) {
  if (mode.mode !== 'DUAL_AGENT_MODE' || story.epic === 'F') return story.owner + '-' + story.role;
  return story.role === 'arbiter' ? mode.reviewExecutor : mode.implementationExecutor;
}
export function assignIssue(body, story, mode) {
  const start = body.indexOf(ASSIGNMENT_START), end = body.indexOf(ASSIGNMENT_END);
  if ((start < 0) !== (end < 0) || (start >= 0 && end < start)) throw new Error('Malformed assignment block');
  const block = ASSIGNMENT_START + '\nModo: DUAL_AGENT_MODE\nResponsável original: ' + story.owner +
    '\nExecutor atual: ' + executorFor(story, mode) +
    '\nAtribuição original e critérios preservados. Uma implementação por vez; aguardar integração validada.\n' + ASSIGNMENT_END;
  return (start < 0 ? body.trimEnd() + '\n\n' + block : body.slice(0, start) + block + body.slice(end + ASSIGNMENT_END.length)).trimEnd() + '\n';
}
export function validateMode(mode,plan) {
  if(mode.mode!=='DUAL_AGENT_MODE'||mode.implementationExecutor!=='lucas-operational'||mode.reviewExecutor!=='lucas-arbiter')throw new Error('Invalid dual mode');
  const ids=plan.stories.filter(s=>s.epic!=='0'&&s.epic!=='F').map(s=>s.id);
  if(mode.preference.length!==ids.length||new Set(mode.preference).size!==ids.length||mode.preference.some(id=>!ids.includes(id)))throw new Error('Preference must cover feature Stories exactly once');
  return true;
}
export function orderedStories(plan,mode) {
  validateMode(mode,plan);const done=new Set(['BOOT',...plan.stories.filter(s=>s.epic==='0').map(s=>s.id)]),pending=new Set(mode.preference),result=[];
  while(pending.size){const id=mode.preference.find(id=>pending.has(id)&&plan.stories.find(s=>s.id===id).dependsOn.every(dep=>done.has(dep)));
    if(!id)throw new Error('Cycle or missing technical dependency');
    result.push(plan.stories.find(s=>s.id===id));pending.delete(id);done.add(id);}
  return result;
}
export function queue(plan,map,mode,issues) {
  const byNumber=new Map(issues.filter(i=>!i.pull_request).map(i=>[i.number,i]));
  const roadmap=orderedStories(plan,mode).filter(s=>s.role==='operational').map(s=>({
    number:map[s.id]?.number,id:s.id,title:s.title,originalOwner:s.owner,executor:'lucas-operational',
    technicalDependencies:s.dependsOn.map(id=>map[id]?.number),open:byNumber.get(map[s.id]?.number)?.state==='open'
  }));
  return {roadmap:roadmap.filter(s=>s.open),notice:'Roteiro técnico; estados/fechamentos administrativos não autorizam nem bloqueiam implementação. Conferir código existente, testes e revisão do árbitro.'};
}
