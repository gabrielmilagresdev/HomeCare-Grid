/** Contrato v1. IDs opacos: UUID no backend; prefixo demo em fixtures. */
export type ID = string;
export type UserRole = 'recipient' | 'contractor' | 'professional';
export type BookingStatus = 'requested' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
export type ErrorCode = 'validation' | 'unauthorized' | 'not_found' | 'conflict' | 'network' | 'timeout' | 'unavailable';
export type Result<T> = { ok: true; data: T } | { ok: false; error: { code: ErrorCode; message: string } };
export type RemoteState<T> = { status: 'loading' } | { status: 'empty' } | { status: 'error'; message: string } | { status: 'ready'; data: T };
export interface User { id: ID; displayName: string; roles: UserRole[] }
export interface CareRecipient { id: ID; ownerUserId: ID; displayName: string }
export interface FamilyMembership { id: ID; recipientId: ID; userId: ID; canBook: boolean; canViewSchedule: boolean; revokedAt: string | null }
export interface Service { id: ID; name: string; requiresCredential: boolean }
export interface TimeWindow { startsAt: string; endsAt: string }
export interface Professional {
  id: ID; userId: ID; displayName: string; serviceIds: ID[]; regionCodes: string[];
  credentialStatus: 'unverified' | 'verified' | 'rejected';
  availability: TimeWindow[]; hourlyPriceCents: number; accessibilityTags: string[];
}
export interface CareRequest extends TimeWindow {
  id: ID; recipientId: ID; requesterUserId: ID; serviceId: ID; regionCode: string;
  requiredAccessibilityTags: string[]; maxPriceCents: number | null;
}
export interface ConciergeFilters {
  serviceId: ID | null; regionCode: string | null; window: TimeWindow | null;
  frequency: string | null; accessibilityTags: string[]; clarificationNeeded: boolean;
}
export interface Match { professionalId: ID; reasons: string[]; hourlyPriceCents: number }
export interface Booking extends TimeWindow {
  id: ID; requestId: ID; recipientId: ID; requesterUserId: ID; professionalId: ID;
  status: BookingStatus; version: number;
}
export interface BookingEvent { id: ID; bookingId: ID; actorUserId: ID; from: BookingStatus; to: BookingStatus; createdAt: string }
export interface ConsentRecord { id: ID; userId: ID; purpose: 'unserved_demand'; policyVersion: string; grantedAt: string; revokedAt: string | null }
export interface UnservedDemand { id: ID; requesterUserId: ID; serviceId: ID; regionCode: string; consentId: ID; createdAt: string }
export interface SimulatedPayment { id: ID; bookingId: ID; amountCents: number; currency: 'BRL'; mode: 'simulated'; status: 'pending' | 'simulated_paid' }
