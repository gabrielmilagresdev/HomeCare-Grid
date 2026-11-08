import { bodyDependencies } from '../pr-policy.mjs';
export const ACTORS = ['gabriel-operational','lucas-operational','julio-operational','matheus-operational','lucas-arbiter'];
export const REQUIRED_CHECKS = ['quality','pr-policy'];
export function roleOf(id) { if(!ACTORS.includes(id))throw new Error('Unknown actor');return id==='lucas-arbiter'?'arbiter':'operational'; }
export function cleanPath(name) {
  if(typeof name!=='string'||!name||name.includes('\\')||name.startsWith('/')||name.split('/').some(p=>p==='..'||p==='.'||!p)||name.includes(':')||name.includes('\0')||name.split('/').some(p=>p.toLowerCase()==='.git'))throw new Error('Unsafe path');
  return name;
}
export function withinScope(file, scopes) {
  cleanPath(file);
  return scopes.some(scope=>{
    cleanPath(scope);
    const escaped=scope.split('**').map(part=>part.split('*').map(p=>p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('[^/]*')).join('.*');
    return new RegExp('^'+escaped+'$').test(file)||(scope.endsWith('/**')&&file===scope.slice(0,-3));
  });
}
export function resourcesFor(scopes) {
  const groups=new Map([['package.json','dependencies'],['package-lock.json','dependencies'],['app.json','app-config'],['tsconfig.json','types-config'],['app/_layout.tsx','navigation'],['src/domain','domain'],['src/services/contracts.ts','domain'],['supabase','backend'],['.github','ci'],['.agents','governance'],['.codex','governance'],['AGENTS.md','governance']]);
  return [...new Set(scopes.flatMap(scope=>{
    const raw=scope.endsWith('/**')?scope.slice(0,-3):scope;cleanPath(raw);
    const prefix=raw.includes('*')?raw.slice(0,raw.indexOf('*')).split('/').slice(0,-1).join('/'):raw;
    if(!prefix)throw new Error('Root wildcard scope requires manual serialization');
    const result=['path/'+prefix];
    for(const [start,group]of groups)if(prefix===start||prefix.startsWith(start+'/')||start.startsWith(prefix+'/'))result.push('shared/'+group);
    return result;
  }))];
}
export function dependenciesFor(issue, plan, map) {
  const deps=new Set(bodyDependencies(issue.body));
  for(const story of plan.stories)if(map[story.id]?.number===issue.number)for(const id of story.dependsOn){if(!map[id]?.number)throw new Error('Dependency mapping missing');deps.add(map[id].number);}
  return [...deps];
}
export async function eligible(issue, actor, {plan,map,readIssue,statuses=['status:ready']}) {
  const reasons=[], labels=(issue.labels??[]).map(l=>typeof l==='string'?l:l.name);
  const owner=actor.id.split('-')[0],role=roleOf(actor.id);
  if(issue.pull_request||issue.state!=='open')reasons.push('Issue must be open');
  if(!labels.includes('owner:'+owner)||!labels.includes('agent:'+role))reasons.push('Owner/role mismatch');
  if(!statuses.includes(labels.filter(l=>l.startsWith('status:')).join()))reasons.push('Issue is not Ready');
  const story=plan.stories.find(s=>map[s.id]?.number===issue.number);
  if(!story||!story.files?.length)reasons.push('No reviewed canonical scope');
  for(const n of dependenciesFor(issue,plan,map)) {
    const dep=await readIssue(n), ls=(dep.labels??[]).map(l=>typeof l==='string'?l:l.name);
    if(dep.state!=='closed'||dep.state_reason!=='completed'||!ls.includes('integration:verified'))reasons.push('Dependency #'+n+' not integrated/verified');
  }
  return {ready:!reasons.length,reasons,scopes:story?.files??[],resources:story?resourcesFor(story.files):[]};
}
export function validProtection(rule) {
  if(!rule||!Array.isArray(rule.rules)||rule.enforcement!=='active'||rule.bypass_actors?.length||rule.current_user_can_bypass!=='never')return false;
  const targets=rule.conditions?.ref_name;
  if(!targets||!['refs/heads/main','refs/heads/develop'].every(n=>targets.include?.includes(n))||!Array.isArray(targets.exclude)||targets.exclude.length)return false;
  const pr=rule.rules.find(r=>r.type==='pull_request')?.parameters;
  const checks=rule.rules.find(r=>r.type==='required_status_checks')?.parameters;
  return Boolean(pr&&pr.required_approving_review_count>=1&&pr.dismiss_stale_reviews_on_push&&pr.require_last_push_approval&&pr.required_review_thread_resolution&&pr.require_code_owner_review&&checks?.strict_required_status_checks_policy&&REQUIRED_CHECKS.every(name=>checks.required_status_checks.some(c=>c.context===name&&c.integration_id===15368))&&['deletion','non_fast_forward'].every(t=>rule.rules.some(r=>r.type===t)));
}
export function independentHumanApproval(reviews, pr, actor, allowedHumans) {
  const latest=new Map();
  for(const review of reviews)if(review.state!=='COMMENTED'&&review.state!=='PENDING')latest.set(review.user.login,review);
  const relevant=[...latest.values()];
  if(relevant.some(r=>r.state==='CHANGES_REQUESTED'))return false;
  return relevant.some(r=>r.state==='APPROVED'&&r.commit_id===pr.head.sha&&r.user.type==='User'&&
    r.user.login!==pr.user.login&&r.user.login!==actor.humanLogin&&allowedHumans.includes(r.user.login));
}
export function validExclusiveRule(rule,appId) {
  const refs=rule?.conditions?.ref_name;
  return Boolean(Number.isSafeInteger(appId)&&appId>0&&rule?.enforcement==='active'&&
    refs?.include?.includes('refs/heads/main')&&refs.include.includes('refs/heads/develop')&&refs.exclude?.length===0&&
    rule.rules?.length===1&&rule.rules[0].type==='update'&&
    rule.bypass_actors?.length===1&&rule.bypass_actors[0].actor_type==='Integration'&&
    rule.bypass_actors[0].actor_id===appId&&rule.bypass_actors[0].bypass_mode==='pull_request');
}
export const READINESS_GATES = ['exclusiveArbiterRule','credentials','isolatedContainers','codexConfigLoaded','nonInteractivePilot','networkIsolation','operatorMergeDenied','failedCiBlocksMerge','independentReview','staleReviewDismissed','arbiterMergeAllowed','recoveryPilot','fullPilot'];
export function readiness({rule,evidence,now=Date.now(),foundation,actors,dockerAvailable=false,exclusiveRule,arbiterAppId}) {
  const blockers=[];
  if(!validProtection(rule))blockers.push('Native protection is incomplete');
  if(!validExclusiveRule(exclusiveRule,arbiterAppId))blockers.push('Native merge restriction to arbiter App is absent');
  if(!dockerAvailable)blockers.push('Docker unavailable');
  if(!foundation)blockers.push('Foundation #2/#17 not accepted and verified');
  if(!evidence||!Number.isFinite(evidence.expiresAt)||evidence.expiresAt<=now)blockers.push('Readiness evidence missing/expired');
  for(const gate of READINESS_GATES)if(evidence?.gates?.[gate]!==true)blockers.push('Missing evidence: '+gate);
  if(actors.length!==5||new Set(actors.map(a=>a.githubLogin).filter(Boolean)).size!==5)blockers.push('Five distinct GitHub identities not verified');
  return {ready:!blockers.length,verdict:blockers.length?'NOT READY — BLOCKERS REMAIN':'READY FOR AUTONOMOUS DEVELOPMENT',blockers};
}