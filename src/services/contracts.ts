import type { Booking, BookingStatus, CareRequest, ConciergeFilters, ID, Professional, Result, Service } from '../domain/types/index.ts';
export interface CatalogService { listServices(): Promise<Result<Service[]>>; listProfessionals(): Promise<Result<Professional[]>> }
export interface BookingService {
  request(input: CareRequest, professionalId: ID, idempotencyKey: string): Promise<Result<Booking>>;
  transition(bookingId: ID, to: BookingStatus, expectedVersion: number): Promise<Result<Booking>>;
  listForRecipient(recipientId: ID): Promise<Result<Booking[]>>;
}
export interface ConciergeService { interpret(text: string, signal?: AbortSignal): Promise<Result<ConciergeFilters>> }
/** Sessão/autor derivados do JWT no backend. Nunca aceitar identidade fornecida pelo cliente como autoridade. */
