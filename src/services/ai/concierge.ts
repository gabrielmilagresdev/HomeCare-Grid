import type { ConciergeFilters, Result } from '../../domain/types/index.ts';
import { parseConciergeFilters } from '../../domain/schemas/index.ts';
import type { DemoFixture } from '../../testing/fixtures.ts';

const apiUrl = process.env.EXPO_PUBLIC_CONCIERGE_API_URL;
const clientToken = process.env.EXPO_PUBLIC_CONCIERGE_CLIENT_TOKEN;

export const remoteConciergeConfigured = Boolean(apiUrl && clientToken);

function failure(code: 'network' | 'timeout' | 'unavailable' | 'validation', message: string): Result<ConciergeFilters> {
  return { ok: false, error: { code, message } };
}

/** The client accepts only catalog IDs and symbolic slots, never arbitrary model text. */
export function parseRemoteSuggestion(input: unknown, fixture: DemoFixture): Result<ConciergeFilters> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return failure('validation', 'Resposta do concierge inválida.');
  const value = input as Record<string, unknown>;
  if (Object.keys(value).sort().join(',') !== 'accessibilityTags,clarificationNeeded,regionCode,serviceId,slot') return failure('validation', 'Resposta do concierge incompleta.');
  if (!['suggested', 'alternate', 'none'].includes(String(value.slot))) return failure('validation', 'Horário inválido.');
  const window = value.slot === 'none' ? null : value.slot === 'alternate' ? fixture.alternateWindow : fixture.suggestedWindow;
  return parseConciergeFilters({ serviceId: value.serviceId, regionCode: value.regionCode, window,
    frequency: null, accessibilityTags: value.accessibilityTags, clarificationNeeded: value.clarificationNeeded },
    fixture.services.map(item => item.id), ['DEMO-CENTRO', 'DEMO-ZONA-SUL', 'DEMO-ZONA-OESTE', 'DEMO-ZONA-NORTE']);
}

export async function interpretRemoteConcierge(text: string, fixture: DemoFixture, fetchImpl: typeof fetch = fetch): Promise<Result<ConciergeFilters>> {
  if (!apiUrl || !clientToken) return failure('unavailable', 'Concierge indisponível no momento.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetchImpl(`${apiUrl.replace(/\/$/u, '')}/v1/concierge/interpret`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ text }), signal: controller.signal
    });
    if (!response.ok) return failure('unavailable', 'Concierge indisponível no momento.');
    return parseRemoteSuggestion(await response.json(), fixture);
  } catch (cause) {
    return failure(cause instanceof Error && cause.name === 'AbortError' ? 'timeout' : 'network', 'Concierge indisponível no momento.');
  } finally { clearTimeout(timeout); }
}
