import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluatePullRequest, snapshotErrors, FOUNDATION_BASELINE } from './pr-policy.mjs';

export async function runPolicy(event, env, request = fetch) {
  const repository = env.GITHUB_REPOSITORY;
  if (repository !== 'gabrielmilagresdev/HomeCare-Grid' || !event.pull_request || !env.GH_TOKEN) {
    throw new Error('Contexto inválido: PR do repositório HomeCare-Grid e token somente leitura são obrigatórios.');
  }
  const eventPr = event.pull_request;
  if (!Number.isSafeInteger(eventPr.number) || !/^[a-f0-9]{40}$/.test(eventPr.head?.sha ?? '')) throw new Error('Evento de PR inválido.');
  async function get(resource, { allowMissing = false } = {}) {
    const response = await request('https://api.github.com/repos/' + repository + '/' + resource, {
      headers: { Authorization: 'Bearer ' + env.GH_TOKEN, Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(15000)
    });
    if (allowMissing && response.status === 404) return null;
    if (!response.ok) throw new Error('GitHub HTTP ' + response.status + ' ao consultar ' + resource + '; validação bloqueada.');
    return response.json();
  }
  // Reruns/edições usam descrição atual, mas nunca validam outro SHA com o check antigo.
  const pr = await get('pulls/' + eventPr.number);
  const stale = snapshotErrors(pr, eventPr);
  if (stale.length) throw new Error(stale.join('\n'));
  const ref = pr.base.ref === 'main' && pr.base.sha === '104ab172c5d60bc249a75172bbc5d251a4eef363'
    ? FOUNDATION_BASELINE : pr.base.sha;
  async function jsonFile(file) {
    const data = await get('contents/' + file + '?ref=' + ref);
    if (!data?.content || data.encoding !== 'base64') throw new Error('Contrato de dependências indisponível: ' + file);
    return JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
  }
  const plan = await jsonFile('docs/agile/backlog.json');
  const issueMap = await jsonFile('docs/agile/github-map.json');
  if (!Array.isArray(plan.stories) || !issueMap || typeof issueMap !== 'object') throw new Error('Contratos Agile inválidos.');
  const cache = new Map();
  async function readIssue(number) {
    if (!cache.has(number)) cache.set(number, get('issues/' + number));
    return cache.get(number);
  }
  const result = await evaluatePullRequest({ pr, eventPr, repository, readIssue, plan, issueMap });
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    const result = await runPolicy(event, process.env);
    console.log('Rastreabilidade/dependências aprovadas: ' + result.kind + ', Issue #' + result.issueNumber + '.');
    console.log('Este check não autoriza merge: revisão independente e proteções de branches continuam obrigatórias (#17).');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
