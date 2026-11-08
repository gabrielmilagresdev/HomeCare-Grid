import type { ID, Result } from '../types/index.ts';

export interface SimulatedShare { userId: ID; amountCents: number }

/** The remainder is allocated one cent at a time, so shares sum exactly. */
export function splitSimulatedAmount(amountCents: number, participantIds: readonly ID[]): Result<SimulatedShare[]> {
  if (!Number.isSafeInteger(amountCents) || amountCents < 0 || participantIds.length === 0 || new Set(participantIds).size !== participantIds.length)
    return { ok: false, error: { code: 'validation', message: 'Valor ou participantes inválidos.' } };
  const base = Math.floor(amountCents / participantIds.length);
  const remainder = amountCents % participantIds.length;
  return { ok: true, data: participantIds.map((userId, index) => ({ userId, amountCents: base + (index < remainder ? 1 : 0) })) };
}
