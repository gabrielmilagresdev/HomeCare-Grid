import { Buffer } from 'node:buffer';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluatePullRequest, linkedIssues, acceptance, FOUNDATION_PROMOTION } from '../scripts/pr-policy.mjs';
import { runPolicy } from '../scripts/check-pr.mjs';

const repository = 'gabrielmilagresdev/HomeCare-Grid';
function pr(number = 99, body = 'Refs #99', base = 'develop', head = 'fix/99-policy') {
  return { number, state: 'open', body, base: { ref: base, sha: 'a'.repeat(40) },
    head: { ref: head, sha: 'b'.repeat(40), repo: { full_name: repository } } };
}
function issue(number, options = {}) {
  const { status = 'in-progress', role = 'operational', body = '', state = 'open', verified = false, extra = [], stateReason = null } = options;
  return { number, state, state_reason: stateReason, body, labels: [
    { name: 'status:' + status }, { name: 'agent:' + role }, ...extra.map(name => ({ name })),
    ...(verified ? [{ name: 'integration:verified' }] : [])
  ] };
}
const completed = number => issue(number, { state: 'closed', stateReason: 'completed', status: 'done', verified: true });
const checked = '## Critérios de aceite\n- [x] Evidência revisada\n- [x] CI do SHA atual\n';
const pending = '## Critérios de aceite\n- [ ] Evidência ausente\n';
async function evaluate(p = pr(), entries = [issue(99)], extra = {}) {
  const data = new Map(entries.map(i => [i.number, i]));
  return evaluatePullRequest({ pr: p, repository, readIssue: async number => {
    if (!data.has(number)) throw new Error('Issue ausente #' + number);
    return data.get(number);
  }, plan: { stories: [] }, issueMap: {}, ...extra });
}
const has = (result, expression) => assert.ok(result.errors.some(error => expression.test(error)), result.errors.join('\n'));

test('PR operacional válido', async () => {
  const result = await evaluate();
  assert.deepEqual(result.errors, []); assert.equal(result.kind, 'operational');
  assert.equal(result.requiresIndependentReview, true);
});
test('PR sem referência a Issue', async () => has(await evaluate(pr(99, null)), /sem Issue vinculada/));
test('referência citada em comentário, quote ou código não autoriza PR', () => {
  assert.deepEqual(linkedIssues('<!-- Refs #1 -->\n> Refs #2\n```md\nRefs #3\n```'), []);
});
test('Issue vinculada incorretamente à branch', async () => has(await evaluate(pr(99, 'Refs #98'), [issue(98)]), /branch operacional/));
test('múltiplas Issues principais exigem escolha explícita', async () => has(await evaluate(pr(99, 'Refs #99\nFixes #98')), /única Issue/));
test('PR associado a Issue bloqueada', async () => has(await evaluate(pr(), [issue(99, { status: 'blocked' })]), /está bloqueada/));
test('Issue em backlog tem mensagem específica', async () => has(await evaluate(pr(), [issue(99, { status: 'backlog' })]), /em backlog/));
test('Issue sem estado elegível não passa', async () => {
  const value = issue(99); value.labels = [{ name: 'agent:operational' }];
  has(await evaluate(pr(), [value]), /estado elegível/);
});
test('PR e Epic não substituem tarefa rastreável', async () => {
  has(await evaluate(pr(), [{ ...issue(99), pull_request: {} }]), /é um PR/);
  has(await evaluate(pr(), [issue(99, { extra: ['type:epic'] })]), /não um Epic/);
});
test('Issue principal encerrada não é reutilizada', async () => has(await evaluate(pr(), [completed(99)]), /não está aberta/));
test('dependência não integrada', async () => {
  has(await evaluate(pr(), [issue(99, { body: 'Blocked by #88' }), issue(88)]), /Dependência #88 não integrada/);
});
test('fechar dependência sem integration:verified não basta', async () => {
  const closed = completed(88); closed.labels = [];
  has(await evaluate(pr(), [issue(99, { body: 'Blocked by #88' }), closed]), /não integrada\/validada/);
});
test('closed/not_planned não comprova integração', async () => {
  has(await evaluate(pr(), [issue(99, { body: 'Blocked by #88' }), { ...completed(88), state_reason: 'not_planned' }]), /não integrada/);
});
test('dependência integrada e validada permite verificação operacional', async () => {
  assert.deepEqual((await evaluate(pr(), [issue(99, { body: 'Blocked by #88' }), completed(88)])).errors, []);
});
test('dependência canônica não pode ser removida editando texto da Issue', async () => {
  const result = await evaluate(pr(), [issue(99), issue(88)], {
    plan: { stories: [{ id: 'T', dependsOn: ['D'] }] }, issueMap: { T: { number: 99 }, D: { number: 88 } }
  });
  has(result, /Dependência #88/);
});
test('dependência canônica sem mapeamento falha fechada', async () => {
  has(await evaluate(pr(), [issue(99)], {
    plan: { stories: [{ id: 'T', dependsOn: ['missing'] }] }, issueMap: { T: { number: 99 } }
  }), /sem mapeamento/);
});
test('bootstrap não ignora status nem dependências', async () => {
  const p = pr(12, 'Refs #2', 'develop', 'chore/2-bootstrap-foundation');
  const blocked = await evaluate(p, [issue(2, { status: 'blocked', body: 'Blocked by #17' }), issue(17)]);
  assert.equal(blocked.kind, 'bootstrap'); has(blocked, /está bloqueada/); has(blocked, /Dependência #17/);
  has(await evaluate(p, [issue(2), issue(17)]), /Dependência #17/);
  assert.deepEqual((await evaluate(p, [issue(2), completed(17)])).errors, []);
});
const release = () => pr(70, 'Refs #43', 'main', 'develop');
test('release elegível mantém revisão independente obrigatória', async () => {
  const result = await evaluate(release(), [issue(43, { role: 'arbiter', status: 'in-review', body: checked }), completed(41), completed(42)]);
  assert.equal(result.kind, 'release'); assert.deepEqual(result.errors, []);
  assert.equal(result.requiresIndependentReview, true); assert.deepEqual(result.dependencies, [41, 42]);
});
test('release ainda bloqueada lista status, dependências e critérios', async () => {
  const result = await evaluate(release(), [issue(43, { role: 'arbiter', status: 'blocked', body: pending }), issue(41), issue(42)]);
  has(result, /está bloqueada/); has(result, /Dependência #41/); has(result, /Dependência #42/); has(result, /critérios pendentes/);
});
test('develop como origem não dispensa dependências da release', async () => {
  has(await evaluate(release(), [issue(43, { role: 'arbiter', body: checked }), issue(41), completed(42)]), /Dependência #41/);
});
test('Issue operacional pronta não pode autorizar release em main', async () => {
  const result = await evaluate(pr(70, 'Refs #99', 'main', 'develop'), [issue(99, { body: checked }), completed(41), completed(42)]);
  has(result, /release develop → main exige #43/); has(result, /agent:arbiter/);
});
test('release sem checklist de aceite não é elegível', async () => {
  has(await evaluate(release(), [issue(43, { role: 'arbiter' }), completed(41), completed(42)]), /seção Critérios de aceite ausente/);
});
test('checklist de Tasks fora do aceite não é confundido com pendência de release', () => {
  assert.deepEqual(acceptance(checked + '\n## Tasks\n- [ ] Depois da integração'), { total: 2, pending: 0 });
});
const promotion = () => { const p = pr(52, 'Refs #53', 'main', 'develop'); p.base.sha = FOUNDATION_PROMOTION.initialMain; return p; };
const promotionIssue = options => issue(53, { role: 'arbiter', body: checked, extra: ['type:foundation-promotion'], ...options });
test('promoção inicial tem todos os gates; não usa artificialmente a release #43', async () => {
  const result = await evaluate(promotion(), [promotionIssue(), completed(2), completed(17)]);
  assert.deepEqual(result.errors, []); assert.equal(result.kind, 'foundation-promotion'); assert.deepEqual(result.dependencies, [2, 17]);
});
test('promoção inicial permanece bloqueada por #2 e #17', async () => {
  const result = await evaluate(promotion(), [promotionIssue({ status: 'blocked', body: pending }), issue(2, { status: 'in-review' }), issue(17, { status: 'blocked' })]);
  has(result, /Dependência #2/); has(result, /Dependência #17/); has(result, /critérios pendentes/);
});
test('promoção não é exceção genérica: outro PR ou main avançado são negados', async () => {
  for (const p of [{ ...promotion(), number: 71 }, { ...promotion(), base: { ref: 'main', sha: 'c'.repeat(40) } }]) {
    has(await evaluate(p, [promotionIssue(), completed(2), completed(17)]), /restrita ao PR #52/);
  }
});
test('main só recebe develop do próprio repositório', async () => {
  const p = release(); p.head.repo.full_name = 'other/repo';
  has(await evaluate(p, [issue(43, { role: 'arbiter', body: checked }), completed(41), completed(42)]), /próprio repositório/);
});
test('execução de SHA anterior não valida PR atual', async () => {
  const p = pr(); const old = structuredClone(p); old.head.sha = 'c'.repeat(40);
  has(await evaluate(p, [issue(99)], { eventPr: old }), /Execução obsoleta/);
});
function apiMock(current, overrides = {}) {
  const calls = [];
  const request = async (url, options) => {
    calls.push(url); assert.equal(options.headers.Authorization, 'Bearer test-only');
    const resource = url.split('/repos/' + repository + '/')[1];
    let value;
    if (resource === 'pulls/99') value = current;
    else if (resource.startsWith('contents/')) value = { encoding: 'base64', content: Buffer.from(JSON.stringify(resource.includes('backlog.json') ? { stories: [] } : {})).toString('base64') };
    else if (resource === 'issues/99') value = issue(99);
    else throw new Error('Endpoint inesperado ' + resource);
    return { ok: true, status: 200, json: async () => value, ...overrides };
  };
  return { request, calls };
}
const env = { GITHUB_REPOSITORY: repository, GH_TOKEN: 'test-only' };
test('adapter usa descrição atual após edição, com mesmo SHA', async () => {
  const live = pr(); const eventPr = { ...pr(), body: null }; const mock = apiMock(live);
  assert.deepEqual((await runPolicy({ pull_request: eventPr }, env, mock.request)).errors, []);
  assert.ok(mock.calls.some(url => url.includes('?ref=' + live.base.sha)));
});
test('adapter recusa metadados atuais de SHA diferente antes de ler dependências', async () => {
  const live = pr(); live.head.sha = 'c'.repeat(40); const mock = apiMock(live);
  await assert.rejects(runPolicy({ pull_request: pr() }, env, mock.request), /Execução obsoleta/);
  assert.equal(mock.calls.length, 1);
});
test('erro GitHub não vira aprovação ou vazamento de corpo HTTP', async () => {
  await assert.rejects(runPolicy({ pull_request: pr() }, env, apiMock(pr(), { ok: false, status: 403 }).request), /HTTP 403/);
});
test('workflow revalida edição sem trocar permissões ou usar pull_request_target', () => {
  const yaml = fs.readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  assert.match(yaml, /types: \[opened, synchronize, reopened, edited, ready_for_review, converted_to_draft\]/);
  assert.ok(yaml.includes('node --test tests/pr-policy.test.mjs'));
  assert.ok(yaml.includes('pull-requests: read')); assert.equal(yaml.includes('pull_request_target:'), false);
});
