/** Política de rastreabilidade; aprovação independente e proteção continuam gates de merge. */
export const BOOTSTRAP_ISSUE = 2;
export const RELEASE_ISSUE = 43;
// Promoção inicial única auditada: não é exceção de status, dependências ou revisão.
export const FOUNDATION_PROMOTION = Object.freeze({
  issue: 53, pr: 52, initialMain: '104ab172c5d60bc249a75172bbc5d251a4eef363'
});
export const FOUNDATION_BASELINE = '6dbaa779d39635bd6525d255f72620bc01cff412';

function prose(body = '') {
  return body.replace(/<!--[\s\S]*?-->/g, '').replace(/^```[\s\S]*?^```[^\n]*/gm, '').replace(/^>.*$/gm, '');
}
export function linkedIssues(body) {
  return [...new Set([...prose(body ?? '').matchAll(/^\s*(?:Refs|Closes|Fixes|Related to)\s+#([1-9]\d*)\s*\.?\s*$/gmi)].map(m => Number(m[1])))];
}
export function bodyDependencies(body) {
  return [...new Set([...prose(body ?? '').matchAll(/\bBlocked by\s+#([1-9]\d*)\b/gi)].map(m => Number(m[1])))];
}
function labels(issue) {
  return (issue.labels ?? []).map(label => typeof label === 'string' ? label : label.name);
}
export function acceptance(body) {
  const lines = prose(body ?? '').split('\n');
  const start = lines.findIndex(line => /^##\s+Critérios de aceite\s*$/i.test(line.trim()));
  if (start < 0) return { total: 0, pending: 0 };
  let total = 0, pending = 0;
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) break;
    const match = /^\s*-\s+\[([ xX])\]/.exec(line);
    if (match) { total++; if (match[1] === ' ') pending++; }
  }
  return { total, pending };
}
export function snapshotErrors(pr, eventPr) {
  if (!eventPr || pr.number !== eventPr.number || pr.head.sha !== eventPr.head.sha ||
      pr.head.ref !== eventPr.head.ref || pr.base.ref !== eventPr.base.ref) {
    return ['Execução obsoleta: número, origem, destino ou SHA do PR mudou. Execute o workflow do evento/SHA atual.'];
  }
  return [];
}
export async function evaluatePullRequest({ pr, eventPr = pr, repository, readIssue, plan, issueMap }) {
  const errors = snapshotErrors(pr, eventPr);
  if (errors.length) return { errors };
  if (pr.state !== 'open') return { errors: ['PR não está aberto; use o evento atual de uma integração aberta.'] };
  const refs = linkedIssues(pr.body);
  if (refs.length !== 1) return { errors: [refs.length === 0
    ? 'PR sem Issue vinculada: adicione uma linha Refs #numero na descrição.'
    : 'Issue vinculada incorretamente: use uma única Issue principal via Refs #numero; outras referências podem ser texto comum.'] };
  const number = refs[0], issue = await readIssue(number);
  if (issue.pull_request) return { errors: ['Issue vinculada incorretamente: #' + number + ' é um PR, não uma Issue.'] };
  if (labels(issue).includes('type:epic')) errors.push('Issue vinculada incorretamente: vincule a tarefa/Story, não um Epic.');
  if (issue.state !== 'open') errors.push('Issue principal #' + number + ' não está aberta; não reutilize tarefa encerrada.');
  let kind;
  if (pr.base.ref === 'develop') {
    kind = pr.head.ref === 'chore/2-bootstrap-foundation' ? 'bootstrap' : 'operational';
    const branch = /^(feature|fix|chore)\/(\d+)-[a-z0-9][a-z0-9-]*$/.exec(pr.head.ref);
    if (!branch || Number(branch[2]) !== number) errors.push('Issue vinculada incorretamente: branch operacional deve ser feature|fix|chore/<Issue>-descricao.');
    if ((kind === 'bootstrap') !== (number === BOOTSTRAP_ISSUE)) errors.push('Bootstrap deve vincular #2 na branch chore/2-bootstrap-foundation e passa pelos mesmos gates.');
  } else if (pr.base.ref === 'main') {
    if (pr.head.ref !== 'develop' || pr.head.repo?.full_name !== repository) errors.push('Integração para main exige develop do próprio repositório como origem.');
    if (number === FOUNDATION_PROMOTION.issue) {
      kind = 'foundation-promotion';
      if (pr.number !== FOUNDATION_PROMOTION.pr || pr.base.sha !== FOUNDATION_PROMOTION.initialMain) {
        errors.push('Promoção inicial restrita ao PR #52 e ao main inicial auditado; não reutilizar #53 em outras integrações.');
      }
      if (!labels(issue).includes('type:foundation-promotion')) errors.push('Issue #53 não está identificada como promoção inicial da fundação.');
    } else {
      kind = 'release';
      if (number !== RELEASE_ISSUE) errors.push('Issue vinculada incorretamente: release develop → main exige #43; a única promoção inicial é #53 no PR #52.');
    }
  } else {
    errors.push('Destino não permitido: use develop para tarefas ou main para integração revisada.');
  }
  const mainIntegration = pr.base.ref === 'main';
  const role = mainIntegration ? 'agent:arbiter' : 'agent:operational';
  if (!labels(issue).includes(role)) errors.push('Issue #' + number + ' exige o papel lógico ' + role + '.');
  const statuses = labels(issue).filter(label => label.startsWith('status:'));
  if (statuses.includes('status:backlog')) errors.push('Issue #' + number + ' ainda está em backlog.');
  else if (statuses.includes('status:blocked')) errors.push('Issue #' + number + ' está bloqueada; Draft não dispensa os requisitos.');
  else if (statuses.length !== 1 || !['status:ready', 'status:in-progress', 'status:in-review', 'status:changes-requested'].includes(statuses[0])) {
    errors.push('Issue #' + number + ' sem um único estado elegível (ready/in-progress/in-review/changes-requested).');
  }
  const dependencies = new Set(bodyDependencies(issue.body));
  for (const story of plan.stories) {
    if (issueMap[story.id]?.number !== number) continue;
    for (const id of story.dependsOn) {
      const dep = issueMap[id]?.number;
      if (!Number.isSafeInteger(dep)) errors.push('Dependência lógica ' + id + ' sem mapeamento GitHub; não ignorar.');
      else dependencies.add(dep);
    }
  }
  // Pisos explícitos impedem retirar pré-requisitos críticos editando o texto da Issue.
  if (kind === 'bootstrap') dependencies.add(17);
  if (kind === 'foundation-promotion') [2, 17].forEach(n => dependencies.add(n));
  if (kind === 'release') [41, 42].forEach(n => dependencies.add(n));
  if (dependencies.size > 100) throw new Error('Mais de 100 dependências: revisar a modelagem antes de validar.');
  for (const depNumber of dependencies) {
    if (depNumber === number) { errors.push('Issue #' + number + ' depende de si mesma.'); continue; }
    const dep = await readIssue(depNumber);
    if (dep.pull_request || dep.state !== 'closed' || dep.state_reason !== 'completed' || !labels(dep).includes('integration:verified')) {
      errors.push('Dependência #' + depNumber + ' não integrada/validada: exige Issue closed/completed e integration:verified.');
    }
  }
  if (mainIntegration) {
    const checks = acceptance(issue.body);
    if (!checks.total || checks.pending) errors.push('Integração para main com critérios pendentes na Issue #' + number +
      ': ' + (checks.total ? checks.pending + ' item(ns) de aceite não comprovado(s).' : 'seção Critérios de aceite ausente ou sem checklist.'));
  }
  return { kind, issueNumber: number, dependencies: [...dependencies], errors, requiresIndependentReview: true };
}
