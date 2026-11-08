import type { ID, Result, TimeWindow } from '../types/index.ts';

export interface VisitQuote { attendanceCents: number; travelCents: number; totalCents: number; durationMinutes: number }

/** Price preview from explicit inputs. A remote checkout must revalidate its own total. */
export function quoteVisit(hourlyPriceCents: number, window: TimeWindow, travelCents: number): Result<VisitQuote> {
  const durationMinutes = (Date.parse(window.endsAt) - Date.parse(window.startsAt)) / 60000;
  if (!Number.isSafeInteger(hourlyPriceCents) || hourlyPriceCents < 0 || !Number.isSafeInteger(travelCents) || travelCents < 0 ||
    !Number.isSafeInteger(durationMinutes) || durationMinutes <= 0 || durationMinutes > 480)
    return { ok: false, error: { code: 'validation', message: 'Não foi possível calcular o valor desta visita.' } };
  const attendanceCents = Math.round(hourlyPriceCents * durationMinutes / 60);
  const totalCents = attendanceCents + travelCents;
  if (!Number.isSafeInteger(totalCents)) return { ok: false, error: { code: 'validation', message: 'Valor total inválido.' } };
  return { ok: true, data: { attendanceCents, travelCents, totalCents, durationMinutes } };
}

export interface SimulatedShare { userId: ID; amountCents: number }

/** The remainder is allocated one cent at a time, so shares sum exactly. */
export function splitSimulatedAmount(amountCents: number, participantIds: readonly ID[]): Result<SimulatedShare[]> {
  if (!Number.isSafeInteger(amountCents) || amountCents < 0 || participantIds.length === 0 || new Set(participantIds).size !== participantIds.length)
    return { ok: false, error: { code: 'validation', message: 'Valor ou participantes inválidos.' } };
  const base = Math.floor(amountCents / participantIds.length);
  const remainder = amountCents % participantIds.length;
  return { ok: true, data: participantIds.map((userId, index) => ({ userId, amountCents: base + (index < remainder ? 1 : 0) })) };
}
