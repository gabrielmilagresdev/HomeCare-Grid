import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { interpretWithGrok } from './concierge.mjs';

const MAX_BODY_BYTES = 2048;

function equalToken(actual, expected) {
  const left = Buffer.from(actual ?? '');
  const right = Buffer.from(expected ?? '');
  return right.length > 0 && left.length === right.length && timingSafeEqual(left, right);
}

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('too_large');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('invalid_json'); }
}

/** Local companion API. Bind to loopback unless explicitly using a trusted LAN. */
export function createConciergeServer({ clientToken, apiKey = process.env.XAI_API_KEY, fetchImpl = fetch, maxCalls = 60, now = Date.now } = {}) {
  let totalCalls = 0;
  let activeCalls = 0;
  const recentCalls = [];
  return createServer(async (request, response) => {
    if (request.method !== 'POST' || request.url !== '/v1/concierge/interpret') { send(response, 404, { error: 'Rota não encontrada.' }); return; }
    if (!equalToken(request.headers.authorization?.replace(/^Bearer /u, ''), clientToken)) { send(response, 401, { error: 'Sessão inválida.' }); return; }
    if (!apiKey) { send(response, 503, { error: 'Concierge indisponível no momento.' }); return; }
    if (request.headers['content-type']?.split(';')[0] !== 'application/json') { send(response, 415, { error: 'Envie JSON.' }); return; }
    while (recentCalls.length && recentCalls[0] <= now() - 60000) recentCalls.shift();
    if (totalCalls >= maxCalls || recentCalls.length >= 6 || activeCalls >= 2) { send(response, 429, { error: 'Limite temporário atingido.' }); return; }
    let body;
    try { body = await readJson(request); }
    catch (cause) { send(response, cause.message === 'too_large' ? 413 : 400, { error: 'Pedido inválido.' }); return; }
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).join(',') !== 'text') { send(response, 400, { error: 'Pedido inválido.' }); return; }
    totalCalls += 1;
    recentCalls.push(now());
    activeCalls += 1;
    try {
      const result = await interpretWithGrok(body.text, { apiKey, fetchImpl });
      if (result.ok) send(response, 200, result.data);
      else send(response, result.error.code === 'validation' ? 422 : result.error.code === 'timeout' ? 504 : 503, { error: result.error.message });
    } finally { activeCalls -= 1; }
  });
}
