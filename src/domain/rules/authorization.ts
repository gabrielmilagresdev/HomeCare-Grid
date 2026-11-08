import type { CareRecipient, FamilyMembership, ID } from '../types/index.ts';
export function canAccessRecipient(userId: ID, recipient: CareRecipient, memberships: readonly FamilyMembership[], action: 'book' | 'viewSchedule'): boolean {
  if (recipient.ownerUserId === userId) return true;
  return memberships.some(m => m.recipientId === recipient.id && m.userId === userId && m.revokedAt === null && (action === 'book' ? m.canBook : m.canViewSchedule));
}
