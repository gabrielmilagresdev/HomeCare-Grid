import { Blob, Buffer } from 'node:buffer';

const STT_ENDPOINT = 'https://api.x.ai/v1/stt';
const STT_MODEL = 'grok-voice-transcribe-2.0';

export async function transcribeWithXai(audio, { apiKey = process.env.XAI_API_KEY, fetchImpl = fetch, timeoutMs = 20000, mimeType = 'audio/mp4' } = {}) {
  if (!apiKey) return { ok: false, error: { code: 'unavailable', message: 'Voz indisponível no momento.' } };
  if (!Buffer.isBuffer(audio) || audio.length < 1024 || audio.length > 2_500_000) {
    return { ok: false, error: { code: 'validation', message: 'Grave uma mensagem curta e tente novamente.' } };
  }
  const form = new FormData();
  form.append('model', STT_MODEL);
  form.append('language', 'pt');
  const wav = ['audio/wav', 'audio/x-wav'].includes(mimeType);
  form.append('file', new Blob([audio], { type: wav ? 'audio/wav' : 'audio/mp4' }), wav ? 'tatinhia.wav' : 'tatinhia.m4a');
  try {
    const response = await fetchImpl(STT_ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form, signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return { ok: false, error: { code: 'unavailable', message: 'Não consegui transcrever agora. Tente novamente ou digite sua mensagem.' } };
    const data = await response.json();
    if (typeof data?.text !== 'string' || !data.text.trim() || data.text.length > 500) {
      return { ok: false, error: { code: 'validation', message: 'Não consegui entender o áudio. Grave novamente, mais perto do microfone.' } };
    }
    return { ok: true, data: { text: data.text.trim() } };
  } catch (cause) {
    return { ok: false, error: { code: cause?.name === 'TimeoutError' || cause?.name === 'AbortError' ? 'timeout' : 'network', message: 'A transcrição falhou. Verifique a conexão e tente novamente.' } };
  }
}
