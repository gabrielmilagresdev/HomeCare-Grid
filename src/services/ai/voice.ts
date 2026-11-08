import type { Result } from '../../domain/types/index.ts';
import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';

const apiUrl = process.env.EXPO_PUBLIC_CONCIERGE_API_URL;
const clientToken = process.env.EXPO_PUBLIC_CONCIERGE_CLIENT_TOKEN;

export async function transcribeVoice(uri: string, fetchImpl: typeof expoFetch = expoFetch): Promise<Result<string>> {
  if (!apiUrl || !clientToken) return { ok: false, error: { code: 'unavailable', message: 'Voz indisponível. Inicie o serviço TatinhIA e tente novamente.' } };
  if (!uri.startsWith('file:')) return { ok: false, error: { code: 'validation', message: 'Áudio inválido. Grave novamente.' } };
  const form = new FormData();
  form.append('file', new File(uri));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetchImpl(`${apiUrl.replace(/\/$/u, '')}/v1/concierge/transcribe`, {
      method: 'POST', headers: { Authorization: `Bearer ${clientToken}` }, body: form, signal: controller.signal
    });
    if (!response.ok) return { ok: false, error: { code: response.status === 422 ? 'validation' : 'unavailable',
      message: response.status === 422 ? 'Não consegui ouvir sua mensagem. Grave novamente, mais perto do microfone.'
        : 'Não consegui transcrever. Tente novamente ou digite sua mensagem.' } };
    const value = await response.json();
    if (!value || typeof value !== 'object' || Object.keys(value).join(',') !== 'text' || typeof value.text !== 'string'
      || !value.text.trim() || value.text.length > 500) return { ok: false, error: { code: 'validation', message: 'Não consegui entender o áudio. Grave novamente.' } };
    return { ok: true, data: value.text.trim() };
  } catch (cause) {
    return { ok: false, error: { code: cause instanceof Error && cause.name === 'AbortError' ? 'timeout' : 'network', message: 'Falha na transcrição. Verifique a conexão e tente novamente.' } };
  } finally { clearTimeout(timeout); }
}
