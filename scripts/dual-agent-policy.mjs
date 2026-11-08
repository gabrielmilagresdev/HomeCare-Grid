import { bodyDependencies } from './pr-policy.mjs';
export const ROLES = ['lucas-operational', 'lucas-arbiter'];
export const ASSIGNMENT_START = '<!-- hcg:dual-agent-assignment:start -->';
export const ASSIGNMENT_END = '<!-- hcg:dual-agent-assignment:end -->';
const labels = issue => (issue.labels ?? []).map(l => typeof l === 'string' ? l : l.name);
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
export function validateMode(mode, plan) {
  if (mode.schema !== 1 || mode.mode !== 'DUAL_AGENT_MODE' || mode.implementationExecutor !== 'lucas-operational' ||
      mode.reviewExecutor !== 'lucas-arbiter' || mode.maxActiveImplementationIssues !== 1 || !mode.waitUntilIntegration) throw new Error('Invalid dual mode');
  const ids = plan.stories.filter(s => s.epic !== 'F').map(s => s.id);
  if (new Set(mode.preference).size !== ids.length || mode.preference.length !== ids.length ||
      mode.preference.some(id => !ids.includes(id))) throw new Error('Preference must cover MVP Stories exactly once');
  return true;
}
export function orderedStories(plan, mode) {
  validateMode(mode, plan);
  const ordered = [], done = new Set(['BOOT']), pending = new Set(mode.preference);
  while (pending.size) {
    const id = mode.preference.find(id => pending.has(id) && plan.stories.find(s => s.id === id).dependsOn.every(d => done.has(d)));
    if (!id) throw new Error('Cycle or missing dependency');
    const story = plan.stories.find(s => s.id === id); ordered.push(story); pending.delete(id); done.add(id);
  }
  return ordered;
}
export function queue(plan, map, mode, issues) {
  const byNumber = new Map(issues.filter(i => !i.pull_request).map(i => [i.number, i]));
  const stories = orderedStories(plan, mode).filter(s => s.role === 'operational');
  const active = stories.filter(s => {
    const i = byNumber.get(map[s.id]?.number);
    return i?.state === 'open' && labels(i).some(l => ['status:in-progress','status:in-review','status:changes-requested'].includes(l));
  }).map(s => map[s.id].number);
  const candidates = [], blocked = [];
  for (const story of stories) {
    const number = map[story.id]?.number, issue = byNumber.get(number), reasons = [];
    if (!issue || issue.state !== 'open') continue;
    if (labels(issue).filter(l => l.startsWith('status:')).join() !== 'status:ready') reasons.push('Issue is not Ready');
    if (!labels(issue).includes('owner:' + story.owner) || !labels(issue).includes('agent:operational')) reasons.push('Original ownership/role missing');
    if (!issue.body?.includes('Executor atual: lucas-operational')) reasons.push('Current executor not recorded');
    const dependencies = new Set([...story.dependsOn.map(id => map[id]?.number), ...bodyDependencies(issue.body)]);
    for (const dep of dependencies) {
      const d = byNumber.get(dep);
      if (!Number.isSafeInteger(dep) || !d || d.pull_request || d.state !== 'closed' || d.state_reason !== 'completed' || !labels(d).includes('integration:verified')) reasons.push('Unverified dependency #' + dep);
    }
    const result = { number, id: story.id, title: story.title, originalOwner: story.owner, executor: 'lucas-operational', reasons };
    (reasons.length ? blocked : candidates).push(result);
  }
  return { active, next: active.length ? null : candidates[0] ?? null, candidates: active.length ? [] : candidates, blocked,
    notice: 'Read-only snapshot; re-read live Issues and coordinate one execution before starting. This is not a distributed lock.' };
}
export function readiness(mode, evidence, issues, now = Date.now()) {
  const blockers = [], byNumber = new Map(issues.map(i => [i.number, i]));
  for (const number of [...mode.requiredFoundationIssues, mode.adaptationIssue]) {
    const issue = byNumber.get(number);
    if (!issue || issue.state !== 'closed' || issue.state_reason !== 'completed' || !labels(issue).includes('integration:verified')) blockers.push('Acceptance pending #' + number);
  }
  if (!evidence || !Number.isFinite(evidence.expiresAt) || evidence.expiresAt <= now) blockers.push('Current runtime evidence missing');
  const op = evidence?.identities?.operational, arbiter = evidence?.identities?.arbiter;
  if (op !== mode.github.expectedOperationalLogin || !arbiter) blockers.push('Actual Lucas identities not verified');
  if (mode.github.humanApprover === op) blockers.push('Human approval must be independent of author');
  for (const gate of ['separateWorkspaces','codexConfigLoaded','modelAuthenticated','githubAuthenticated','operatorMergeDenied','nativeProtection','currentCi','independentHumanReview','sandboxEnforced']) {
    if (evidence?.gates?.[gate] !== true || !evidence?.proofs?.[gate]) blockers.push('Missing proof: ' + gate);
  }
  return { ready: blockers.length === 0, verdict: blockers.length ? 'NOT READY — BLOCKERS REMAIN' : 'READY FOR CONTROLLED DUAL DEVELOPMENT',
    independentTechnicalIdentities: Boolean(op && arbiter && op !== arbiter), humanApprover: mode.github.humanApprover, blockers };
}
