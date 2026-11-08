import type { Booking, BookingEvent, BookingStatus, CareRequest, ConsentRecord, FamilyMembership, ID, Result, UnservedDemand } from '../../domain/types/index.ts';
import { canAccessRecipient } from '../../domain/rules/authorization.ts';
import { canTransition, overlaps } from '../../domain/rules/bookings.ts';
import { rankProfessionals } from '../../domain/rules/matching.ts';
import { parseCareRequest } from '../../domain/schemas/index.ts';
import { createDemoFixture, type DemoFixture } from '../../testing/fixtures.ts';

const fail = <T>(code: 'validation' | 'unauthorized' | 'not_found' | 'conflict', message: string): Result<T> => ({ ok: false, error: { code, message } });
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export interface DemandAggregate { serviceId: ID; regionCode: string; count: number }
const syntheticAggregates: DemandAggregate[] = [
  { serviceId: 'demo-service-support', regionCode: 'DEMO-CENTRO', count: 6 },
  { serviceId: 'demo-service-physio', regionCode: 'DEMO-ZONA-NORTE', count: 3 }
];

/** Session-scoped adapter. This is never a remote authorization boundary. */
export class DemoEngine {
  readonly fixture: DemoFixture;
  private bookings: Booking[] = [];
  private requests: CareRequest[] = [];
  private events: BookingEvent[] = [];
  private memberships: FamilyMembership[];
  private consents: ConsentRecord[] = [];
  private demands: UnservedDemand[] = [];
  private idempotency = new Map<string, { bookingId: ID; fingerprint: string }>();
  private sequence = 0;

  constructor(now = new Date()) {
    this.fixture = createDemoFixture(now);
    this.memberships = clone(this.fixture.memberships);
  }

  getMemberships(actorUserId: ID): Result<FamilyMembership[]> {
    if (actorUserId !== this.fixture.recipient.ownerUserId && !this.memberships.some(m => m.userId === actorUserId && m.revokedAt === null))
      return fail('unauthorized', 'Sem vínculo ativo para esta pessoa.');
    return { ok: true, data: clone(this.memberships.filter(m => m.recipientId === this.fixture.recipient.id && (actorUserId === this.fixture.recipient.ownerUserId || m.userId === actorUserId))) };
  }

  setFamilyPermission(actorUserId: ID, userId: ID, permission: 'canBook' | 'canViewSchedule' | 'revoke', enabled = true): Result<FamilyMembership> {
    if (actorUserId !== this.fixture.recipient.ownerUserId) return fail('unauthorized', 'Só o responsável pode gerenciar vínculos.');
    const membership = this.memberships.find(m => m.userId === userId && m.recipientId === this.fixture.recipient.id);
    if (!membership) return fail('not_found', 'Vínculo não encontrado.');
    if (permission === 'revoke') membership.revokedAt = new Date().toISOString();
    else if (membership.revokedAt !== null) return fail('conflict', 'Vínculo revogado.');
    else membership[permission] = enabled;
    return { ok: true, data: clone(membership) };
  }

  request(actorUserId: ID, input: unknown, professionalId: ID, idempotencyKey: string): Result<Booking> {
    const parsed = parseCareRequest(input);
    if (!parsed.ok) return parsed;
    const request = parsed.data;
    if (actorUserId !== request.requesterUserId || request.recipientId !== this.fixture.recipient.id ||
      !canAccessRecipient(actorUserId, this.fixture.recipient, this.memberships, 'book'))
      return fail('unauthorized', 'Você não pode solicitar para esta pessoa.');
    if (!idempotencyKey || idempotencyKey.length > 120) return fail('validation', 'Identificador de envio inválido.');
    const fingerprint = JSON.stringify([request, professionalId]);
    const previous = this.idempotency.get(`${actorUserId}:${idempotencyKey}`);
    if (previous) {
      if (previous.fingerprint !== fingerprint) return fail('conflict', 'Esta confirmação já foi usada para outra solicitação.');
      const booking = this.bookings.find(item => item.id === previous.bookingId);
      return booking ? { ok: true, data: clone(booking) } : fail('not_found', 'Solicitação não encontrada.');
    }
    const service = this.fixture.services.find(item => item.id === request.serviceId);
    if (!service || !rankProfessionals(request, service, this.fixture.professionals).some(match => match.professionalId === professionalId))
      return fail('conflict', 'Profissional indisponível para os filtros escolhidos.');
    const booking: Booking = { id: `demo-booking-${++this.sequence}`, requestId: request.id, recipientId: request.recipientId,
      requesterUserId: actorUserId, professionalId, startsAt: request.startsAt, endsAt: request.endsAt, status: 'requested', version: 1 };
    this.requests.push(clone(request));
    this.bookings.push(booking);
    this.idempotency.set(`${actorUserId}:${idempotencyKey}`, { bookingId: booking.id, fingerprint });
    return { ok: true, data: clone(booking) };
  }

  transition(actorUserId: ID, bookingId: ID, to: BookingStatus, expectedVersion: number, now = new Date()): Result<Booking> {
    const booking = this.bookings.find(item => item.id === bookingId);
    if (!booking) return fail('not_found', 'Solicitação não encontrada.');
    if (!Number.isSafeInteger(expectedVersion) || booking.version !== expectedVersion) return fail('conflict', 'A agenda mudou. Atualize e tente novamente.');
    if (!canTransition(booking.status, to)) return fail('conflict', 'Esta alteração não é permitida no estado atual.');
    const target = this.fixture.professionals.find(p => p.id === booking.professionalId);
    const isTarget = target?.userId === actorUserId;
    const isRequester = canAccessRecipient(actorUserId, this.fixture.recipient, this.memberships, 'book');
    if ((to === 'accepted' || to === 'rejected' || to === 'completed') ? !isTarget : !isTarget && !isRequester)
      return fail('unauthorized', 'Você não pode alterar esta solicitação.');
    if (to === 'completed' && now.getTime() < Date.parse(booking.endsAt)) return fail('conflict', 'O atendimento ainda não terminou.');
    if (to === 'accepted' && this.bookings.some(item => item.id !== booking.id && item.professionalId === booking.professionalId && item.status === 'accepted' && overlaps(item, booking)))
      return fail('conflict', 'Este horário acabou de ser ocupado.');
    const from = booking.status;
    booking.status = to;
    booking.version += 1;
    this.events.push({ id: `demo-event-${this.events.length + 1}`, bookingId, actorUserId, from, to, createdAt: now.toISOString() });
    return { ok: true, data: clone(booking) };
  }

  listForRecipient(actorUserId: ID): Result<Booking[]> {
    if (!canAccessRecipient(actorUserId, this.fixture.recipient, this.memberships, 'viewSchedule'))
      return fail('unauthorized', 'Você não tem acesso à agenda desta pessoa.');
    return { ok: true, data: clone(this.bookings.filter(item => item.recipientId === this.fixture.recipient.id)) };
  }

  listForProfessional(actorUserId: ID): Result<Booking[]> {
    const professional = this.fixture.professionals.find(p => p.userId === actorUserId);
    if (!professional) return fail('unauthorized', 'Acesso restrito ao profissional.');
    return { ok: true, data: clone(this.bookings.filter(item => item.professionalId === professional.id)) };
  }

  getRequest(actorUserId: ID, bookingId: ID): Result<CareRequest> {
    const booking = this.bookings.find(item => item.id === bookingId);
    if (!booking) return fail('not_found', 'Solicitação não encontrada.');
    const authorized = this.fixture.professionals.some(p => p.id === booking.professionalId && p.userId === actorUserId) || canAccessRecipient(actorUserId, this.fixture.recipient, this.memberships, 'viewSchedule');
    if (!authorized) return fail('unauthorized', 'Sem acesso à solicitação.');
    const request = this.requests.find(item => item.id === booking.requestId);
    return request ? { ok: true, data: clone(request) } : fail('not_found', 'Solicitação não encontrada.');
  }

  getEvents(actorUserId: ID, bookingId: ID): Result<BookingEvent[]> {
    const access = this.getRequest(actorUserId, bookingId);
    return access.ok ? { ok: true, data: clone(this.events.filter(e => e.bookingId === bookingId)) } : access;
  }

  recordUnservedDemand(actorUserId: ID, serviceId: ID, regionCode: string, consent: boolean): Result<UnservedDemand> {
    if (!canAccessRecipient(actorUserId, this.fixture.recipient, this.memberships, 'book')) return fail('unauthorized', 'Sem permissão para registrar demanda.');
    if (!consent) return fail('validation', 'O consentimento é necessário.');
    if (!this.fixture.services.some(item => item.id === serviceId) || !['DEMO-CENTRO', 'DEMO-ZONA-SUL', 'DEMO-ZONA-OESTE', 'DEMO-ZONA-NORTE'].includes(regionCode)) return fail('validation', 'Serviço ou região inválidos.');
    const timestamp = new Date().toISOString();
    const consentRecord: ConsentRecord = { id: `demo-consent-${++this.sequence}`, userId: actorUserId, purpose: 'unserved_demand', policyVersion: 'demo-v1', grantedAt: timestamp, revokedAt: null };
    const demand: UnservedDemand = { id: `demo-demand-${this.sequence}`, requesterUserId: actorUserId, serviceId, regionCode, consentId: consentRecord.id, createdAt: timestamp };
    this.consents.push(consentRecord);
    this.demands.push(demand);
    return { ok: true, data: clone(demand) };
  }

  revokeDemandConsent(actorUserId: ID): Result<null> {
    for (const consent of this.consents) if (consent.userId === actorUserId && consent.revokedAt === null) consent.revokedAt = new Date().toISOString();
    return { ok: true, data: null };
  }

  listDemandAggregates(actorUserId: ID): Result<DemandAggregate[]> {
    if (!this.fixture.users.some(user => user.id === actorUserId)) return fail('unauthorized', 'Acesso restrito.');
    // Fixed synthetic projections avoid revealing a newly recorded small group by differencing.
    return { ok: true, data: syntheticAggregates.filter(item => item.count >= 5).map(clone) };
  }
}
