import type { CareRequest, Professional, Service } from '../domain/types/index.ts';
export const demoService: Service = { id: 'demo-service-support', name: 'Apoio cotidiano', requiresCredential: false };
export const demoRequest: CareRequest = {
  id: 'demo-request', recipientId: 'demo-recipient', requesterUserId: 'demo-contractor', serviceId: demoService.id,
  regionCode: 'DEMO-CENTRO', startsAt: '2026-11-09T12:00:00Z', endsAt: '2026-11-09T13:00:00Z',
  requiredAccessibilityTags: [], maxPriceCents: null
};
export const demoProfessionals: Professional[] = [{
  id: 'demo-professional-a', userId: 'demo-user-a', displayName: 'Alex — perfil fictício', serviceIds: [demoService.id],
  regionCodes: ['DEMO-CENTRO'], credentialStatus: 'unverified', hourlyPriceCents: 8000, accessibilityTags: [],
  availability: [{ startsAt: '2026-11-09T10:00:00Z', endsAt: '2026-11-09T18:00:00Z' }]
}];
