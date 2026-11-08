import type { BookingStatus, TimeWindow } from '../types/index.ts';
import { isTimeWindow } from '../schemas/index.ts';

const transitions: Record<BookingStatus, readonly BookingStatus[]> = {
  requested: ['accepted', 'rejected', 'cancelled'],
  accepted: ['cancelled', 'completed'], rejected: [], cancelled: [], completed: []
};
export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}
/** Intervalos semiabertos: [início, fim); horários adjacentes não conflitam. */
export function overlaps(a: TimeWindow, b: TimeWindow): boolean {
  if (!isTimeWindow(a) || !isTimeWindow(b)) throw new Error('Invalid UTC time window');
  return Date.parse(a.startsAt) < Date.parse(b.endsAt) && Date.parse(b.startsAt) < Date.parse(a.endsAt);
}
