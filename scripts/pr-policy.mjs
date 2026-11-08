/** Hackathon: rastreabilidade e condições técnicas; revisão é do árbitro, não aprovação humana. */
export const BOOTSTRAP_ISSUE = 2;
export const RELEASE_ISSUE = 43;
// Mantidos para leitores históricos; não são gates administrativos.
export const FOUNDATION_PROMOTION = Object.freeze({issue:53,pr:52,initialMain:'104ab172c5d60bc249a75172bbc5d251a4eef363'});
export const FOUNDATION_BASELINE = '6dbaa779d39635bd6525d255f72620bc01cff412';
function prose(body='') {return body.replace(/<!--[\s\S]*?-->/g,'').replace(/^```[\s\S]*?^```[^\n]*/gm,'').replace(/^>.*$/gm,'');}
export function linkedIssues(body) {return [...new Set([...prose(body??'').matchAll(/^\s*(?:Refs|Closes|Fixes|Related to)\s+#([1-9]\d*)\s*\.?\s*$/gmi)].map(m=>Number(m[1])))];}
export function bodyDependencies(body) {return [...new Set([...prose(body??'').matchAll(/\bBlocked by\s+#([1-9]\d*)\b/gi)].map(m=>Number(m[1])))];}
export function technicalBlockers(body) {
  const lines=prose(body??'').split('\n'),blocked=[];let section=false;
  for(const line of lines) {
    if(/^##\s+/.test(line))section=/^##\s+(Bloqueios técnicos|Technical blockers)\s*$/i.test(line.trim());
    if(section&&/^\s*-\s+\[ \]/.test(line))blocked.push(line.trim());
    if(/^\s*Technical-blocker:\s*\S/i.test(line))blocked.push(line.trim());
  }
  return blocked;
}
export function snapshotErrors(pr,eventPr) {
  return !eventPr||pr.number!==eventPr.number||pr.head.sha!==eventPr.head.sha||pr.head.ref!==eventPr.head.ref||pr.base.ref!==eventPr.base.ref||
    (eventPr.base.sha&&pr.base.sha!==eventPr.base.sha)?['Execução obsoleta: número, origem, destino ou SHA mudou. Execute a CI do estado atual.']:[];
}
export async function evaluatePullRequest({pr,eventPr=pr,repository,readIssue}) {
  const errors=snapshotErrors(pr,eventPr);if(errors.length)return {errors};
  if(pr.state!=='open')return {errors:['PR não está aberto.']};
  if(!['develop','main'].includes(pr.base.ref))errors.push('Destino não permitido: use develop ou main.');
  if(pr.head.repo?.full_name!==repository)errors.push('Origem deve pertencer ao repositório HomeCare-Grid.');
  if(pr.base.ref==='main'&&pr.head.ref!=='develop')errors.push('main recebe develop por PR.');
  const refs=linkedIssues(pr.body);
  if(refs.length!==1)return {errors:[...errors,'Rastreabilidade: use uma única Issue principal em linha Refs #numero.']};
  const issue=await readIssue(refs[0]);
  if(!issue||issue.pull_request)errors.push('A referência principal deve apontar para uma Issue existente, não um PR.');
  if(technicalBlockers(pr.body).length)errors.push('PR declara bloqueios técnicos pendentes; corrigir antes do merge.');
  return {kind:pr.base.ref==='main'?'release':'operational',issueNumber:refs[0],errors,requiresTechnicalReview:true,requiresIndependentReview:false};
}
