import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { administrativeHints, interpretWithGrok, replyForSuggestion, validateSuggestion } from '../server/concierge.mjs';
import { createConciergeServer } from '../server/http.mjs';
import { transcribeWithXai } from '../server/transcribe.mjs';
import { parseRemoteSuggestion } from '../src/services/ai/concierge.ts';
import { createDemoFixture } from '../src/testing/fixtures.ts';

const validSuggestion = { serviceId: 'demo-service-physio', regionCode: 'DEMO-CENTRO', slot: 'suggested', accessibilityTags: [], clarificationNeeded: false };
const completion = suggestion => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(suggestion) }] }], usage: { input_tokens: 100, output_tokens: 30 } });

test('envia só termos administrativos ao Grok e aplica filtros permitidos', async () => {
  let sent;
  const fetchImpl = async (_url, options) => { sent = JSON.parse(options.body); return { ok: true, status: 200, json: async () => completion(validSuggestion) }; };
  const result = await interpretWithGrok('Fisioterapia amanhã no Centro para Maria, telefone 11999999999', { apiKey: 'test-only', fetchImpl });
  assert.equal(result.ok, true);
  assert.equal(result.data.serviceId, validSuggestion.serviceId);
  assert.equal(result.data.slot, 'suggested');
  assert.match(result.data.reply, /fisioterapia.*Centro.*amanhã/u);
  assert.equal(sent.store, false);
  assert.equal(sent.model, 'grok-4.3');
  assert.equal(sent.text.format.type, 'json_schema');
  assert.ok(!JSON.stringify(sent).includes('Maria'));
  assert.ok(!JSON.stringify(sent).includes('11999999999'));
});

test('não inventa serviço, região, horário ou campos extras', () => {
  assert.equal(validateSuggestion(validSuggestion, ['fisioterapia']).ok, false);
  assert.equal(validateSuggestion({ ...validSuggestion, diagnosis: 'x' }, ['fisioterapia', 'centro', 'amanha']).ok, false);
  assert.equal(validateSuggestion({ ...validSuggestion, serviceId: 'demo-service-nursing' }, ['fisioterapia', 'centro', 'amanha']).ok, false);
  assert.equal(validateSuggestion({ ...validSuggestion, slot: 'alternate' }, ['fisioterapia', 'centro']).ok, false);
  assert.equal(validateSuggestion({ ...validSuggestion, slot: 'alternate' }, ['fisioterapia', 'centro', 'amanha']).ok, false);
  const ambiguous = validateSuggestion({ ...validSuggestion, regionCode: 'none', slot: 'none' }, ['pos-operatorio']);
  assert.equal(ambiguous.ok, false);
  const postOp = validateSuggestion({ serviceId: 'none', regionCode: 'none', slot: 'none', accessibilityTags: [], clarificationNeeded: true }, ['pos-operatorio']);
  assert.equal(postOp.ok, true);
  assert.equal(postOp.data.serviceId, null);
  assert.deepEqual(administrativeHints('Meu CPF 123.456.789-00, preciso de fono na Zona Sul'), ['fonoaudiologia', 'zona sul']);
});

test('cliente revalida a resposta antes de usá-la', () => {
  const fixture = createDemoFixture();
  const answer = { ...validSuggestion, reply: replyForSuggestion(validSuggestion) };
  assert.equal(parseRemoteSuggestion(answer, fixture).ok, true);
  assert.equal(parseRemoteSuggestion({ ...answer, advice: 'consulta' }, fixture).ok, false);
  assert.equal(parseRemoteSuggestion({ ...answer, serviceId: 'unknown' }, fixture).ok, false);
  assert.equal(parseRemoteSuggestion({ ...answer, reply: '' }, fixture).ok, false);
});

test('transcrição encaminha só áudio e modelo de voz, sem persistir conteúdo', async () => {
  let sent;
  const result = await transcribeWithXai(Buffer.alloc(2048, 1), { apiKey: 'test-only', fetchImpl: async (url, options) => {
    sent = { url, options }; return { ok: true, json: async () => ({ text: 'Fisioterapia amanhã no Centro' }) };
  } });
  assert.equal(result.ok, true);
  assert.equal(sent.url, 'https://api.x.ai/v1/stt');
  assert.equal(sent.options.body.get('model'), 'grok-voice-transcribe-2.0');
  assert.equal(sent.options.body.get('language'), 'pt');
  assert.equal(sent.options.body.get('file').type, 'audio/mp4');
  assert.equal(sent.options.headers.Authorization, 'Bearer test-only');
});

test('rota de voz exige sessão, formato e limite de tamanho', async () => {
  let forwardedType;
  const server = createConciergeServer({ clientToken: 'voice-test-token', apiKey: 'test-only', fetchImpl: async (_url, options) => {
    forwardedType = options.body.get('file').type;
    return { ok: true, json: async () => ({ text: 'Enfermagem amanhã' }) };
  } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}/v1/concierge/transcribe`;
    const form = new FormData();
    form.append('file', new Blob([Buffer.alloc(2048, 1)], { type: 'audio/mp4' }), 'voice.m4a');
    assert.equal((await fetch(url, { method: 'POST', body: form })).status, 401);
    const headers = { Authorization: 'Bearer voice-test-token' };
    assert.equal((await fetch(url, { method: 'POST', headers, body: form })).status, 200);
    const expoForm = new FormData();
    expoForm.append('file', new Blob([Buffer.alloc(2048, 1)], { type: 'audio/mpeg' }), 'recording.m4a');
    assert.equal((await fetch(url, { method: 'POST', headers, body: expoForm })).status, 200);
    assert.equal(forwardedType, 'audio/mp4');
    assert.equal((await fetch(url, { method: 'POST', headers, body: JSON.stringify({ file: 'x' }) })).status, 415);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('ausência de chave, cota, formato inválido e rede indisponível retornam erro controlado', async () => {
  assert.equal((await interpretWithGrok('Fisioterapia', { apiKey: '' })).error.code, 'unavailable');
  assert.equal((await interpretWithGrok('Fisioterapia', { apiKey: 'test-only', fetchImpl: async () => ({ ok: false, status: 429 }) })).error.code, 'unavailable');
  assert.equal((await interpretWithGrok('Fisioterapia', { apiKey: 'test-only', fetchImpl: async () => ({ ok: true, status: 200, json: async () => completion({ bogus: true }) }) })).ok, false);
  assert.equal((await interpretWithGrok('Fisioterapia', { apiKey: 'test-only', fetchImpl: async () => { throw new Error('offline'); } })).error.code, 'network');
  assert.equal((await interpretWithGrok('Fisioterapia', { apiKey: 'test-only', fetchImpl: async () => { const error = new Error('timeout'); error.name = 'TimeoutError'; throw error; } })).error.code, 'timeout');
});

test('serviço local exige sessão e aplica limite de chamadas', async () => {
  const server = createConciergeServer({ clientToken: 'local-test-token', apiKey: 'test-only', maxCalls: 1,
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => completion(validSuggestion) }) });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}/v1/concierge/interpret`;
    const body = JSON.stringify({ text: 'Fisioterapia amanhã no Centro' });
    assert.equal((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })).status, 401);
    const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer local-test-token' };
    assert.equal((await fetch(url, { method: 'POST', headers, body })).status, 200);
    assert.equal((await fetch(url, { method: 'POST', headers, body })).status, 429);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
