import type { CareRequest, ConciergeFilters, Result, TimeWindow } from '../types/index.ts';

const invalid = <T>(message: string): Result<T> => ({ ok: false, error: { code: 'validation', message } });
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const nonempty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 120;
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.length <= 20 && v.every(nonempty);
/** Valor digitado em reais; vazio remove o filtro. Converte em centavos sem ponto flutuante. */
export function parseHourlyPriceLimit(text: string): Result<number | null> {
  const value = text.trim().replace(/^R\$\s*/i, '');
  if (!value) return text.trim() ? invalid('Informe um valor como 100 ou 100,50.') : { ok: true, data: null };
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(value)) return invalid('Informe um valor como 100 ou 100,50.');
  const [reais = '', centavos = ''] = value.split(/[,.]/);
  const result = Number(reais) * 100 + Number(centavos.padEnd(2, '0'));
  return Number.isSafeInteger(result) ? { ok: true, data: result } : invalid('Valor máximo fora do limite permitido.');
}
/** Instantes UTC explícitos: sem datas locais ambíguas ou conversão implícita. */
export function isUtcInstant(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return false;
  return new Date(time).toISOString() === value.replace(/(?<!\.\d{3})Z$/, '.000Z');
}
export function isTimeWindow(value: unknown): value is TimeWindow {
  return record(value) && isUtcInstant(value.startsAt) && isUtcInstant(value.endsAt) && Date.parse(value.startsAt) < Date.parse(value.endsAt);
}
export function parseCareRequest(input: unknown): Result<CareRequest> {
  if (!record(input) || !isTimeWindow(input)) return invalid('Informe um intervalo UTC válido.');
  if (![input.id, input.recipientId, input.requesterUserId, input.serviceId, input.regionCode].every(nonempty)) return invalid('Identificadores e região são obrigatórios.');
  if (!strings(input.requiredAccessibilityTags)) return invalid('Necessidades de acessibilidade inválidas.');
  if (input.maxPriceCents !== null && !(typeof input.maxPriceCents === 'number' && Number.isSafeInteger(input.maxPriceCents) && input.maxPriceCents >= 0)) return invalid('Preço inválido.');
  return { ok: true, data: {
    id: input.id as string, recipientId: input.recipientId as string, requesterUserId: input.requesterUserId as string,
    serviceId: input.serviceId as string, regionCode: input.regionCode as string, startsAt: input.startsAt, endsAt: input.endsAt,
    requiredAccessibilityTags: [...input.requiredAccessibilityTags], maxPriceCents: input.maxPriceCents as number | null
  } };
}
/** Allowlist administrativa: descarta campos clínicos/extras e valida catálogos. */
export function parseConciergeFilters(input: unknown, serviceIds: readonly string[], regionCodes: readonly string[]): Result<ConciergeFilters> {
  if (!record(input)) return invalid('Resposta do assistente inválida.');
  const nullableKnown = (v: unknown, known: readonly string[]) => v === null || (typeof v === 'string' && known.includes(v));
  if (!nullableKnown(input.serviceId, serviceIds) || !nullableKnown(input.regionCode, regionCodes)) return invalid('Serviço ou região desconhecidos.');
  if (input.window !== null && !isTimeWindow(input.window)) return invalid('Disponibilidade inválida.');
  if (input.frequency !== null && !['unica', 'semanal'].includes(String(input.frequency))) return invalid('Frequência inválida.');
  if (!strings(input.accessibilityTags) || !input.accessibilityTags.every(tag => ['mobilidade', 'comunicacao', 'wheelchair'].includes(tag)) || typeof input.clarificationNeeded !== 'boolean') return invalid('Resposta incompleta.');
  const window = input.window === null ? null : { startsAt: (input.window as TimeWindow).startsAt, endsAt: (input.window as TimeWindow).endsAt };
  return { ok: true, data: { serviceId: input.serviceId as string | null, regionCode: input.regionCode as string | null,
    window, frequency: input.frequency as string | null, accessibilityTags: [...input.accessibilityTags],
    clarificationNeeded: input.clarificationNeeded || input.serviceId === null || input.regionCode === null || window === null } };
}
