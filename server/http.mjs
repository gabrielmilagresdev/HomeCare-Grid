import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { interpretWithGrok } from './concierge.mjs';
import { transcribeWithXai } from './transcribe.mjs';

const MAX_BODY_BYTES = 2048;
const MAX_AUDIO_BYTES = 2_700_000;

function equalToken(actual, expected) {
  const left = Buffer.from(actual ?? '');
  const right = Buffer.from(expected ?? '');
  return right.length > 0 && left.length === right.length && timingSafeEqual(left, right);
}

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(JSON.stringify(body));
}

async function readBody(request, limit) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new Error('too_large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJson(request) {
  try { return JSON.parse((await readBody(request, MAX_BODY_BYTES)).toString('utf8')); }
  catch (cause) { if (cause.message === 'too_large') throw cause; throw new Error('invalid_json'); }
}

async function readAudio(request) {
  const body = await readBody(request, MAX_AUDIO_BYTES);
  try {
    const form = await new Request('http://localhost/audio', { method: 'POST', headers: { 'Content-Type': request.headers['content-type'] }, body }).formData();
    if ([...form.keys()].join(',') !== 'file') throw new Error('invalid_audio');
    const file = form.get('file');
    const m4a = file?.name?.toLowerCase().endsWith('.m4a') && ['audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/mpeg'].includes(file.type);
    const wav = file?.name?.toLowerCase().endsWith('.wav') && ['audio/wav', 'audio/x-wav'].includes(file.type);
    if (!(file instanceof Blob) || (!m4a && !wav) || file.size > 2_500_000) throw new Error('invalid_audio');
    return { audio: Buffer.from(await file.arrayBuffer()), mimeType: wav ? 'audio/wav' : 'audio/mp4' };
  }
  catch { throw new Error('invalid_json'); }
}

/** Local companion API. Bind to loopback unless explicitly using a trusted LAN. */
export function createConciergeServer({ clientToken, apiKey = process.env.XAI_API_KEY, fetchImpl = fetch, maxCalls = 60, now = Date.now } = {}) {
  let totalCalls = 0;
  let activeCalls = 0;
  const recentCalls = [];
  return createServer(async (request, response) => {
    const interpret = request.url === '/v1/concierge/interpret';
    const transcribe = request.url === '/v1/concierge/transcribe';
    if (request.method !== 'POST' || (!interpret && !transcribe)) { send(response, 404, { error: 'Rota não encontrada.' }); return; }
    if (!equalToken(request.headers.authorization?.replace(/^Bearer /u, ''), clientToken)) { send(response, 401, { error: 'Sessão inválida.' }); return; }
    if (!apiKey) { send(response, 503, { error: 'Concierge indisponível no momento.' }); return; }
    if (interpret && request.headers['content-type']?.split(';')[0] !== 'application/json') { send(response, 415, { error: 'Envie JSON.' }); return; }
    if (transcribe && !request.headers['content-type']?.startsWith('multipart/form-data; boundary=')) { send(response, 415, { error: 'Envie áudio.' }); return; }
    while (recentCalls.length && recentCalls[0] <= now() - 60000) recentCalls.shift();
    if (totalCalls >= maxCalls || recentCalls.length >= 6 || activeCalls >= 2) { send(response, 429, { error: 'Limite temporário atingido.' }); return; }
    let body;
    try { body = interpret ? await readJson(request) : await readAudio(request); }
    catch (cause) { send(response, cause.message === 'too_large' ? 413 : 400, { error: 'Pedido inválido.' }); return; }
    if (interpret && (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).join(',') !== 'text')) { send(response, 400, { error: 'Pedido inválido.' }); return; }
    totalCalls += 1;
    recentCalls.push(now());
    activeCalls += 1;
    try {
      const result = interpret ? await interpretWithGrok(body.text, { apiKey, fetchImpl }) : await transcribeWithXai(body.audio, { apiKey, fetchImpl, mimeType: body.mimeType });
      if (result.ok) send(response, 200, result.data);
      else send(response, result.error.code === 'validation' ? 422 : result.error.code === 'timeout' ? 504 : 503, { error: result.error.message });
    } finally { activeCalls -= 1; }
  });
}
