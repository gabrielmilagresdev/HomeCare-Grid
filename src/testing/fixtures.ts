import type { CareRecipient, CareRequest, FamilyMembership, Professional, Service, TimeWindow, User } from '../domain/types/index.ts';
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

export interface DemoFixture {
  users: User[];
  recipient: CareRecipient;
  memberships: FamilyMembership[];
  services: Service[];
  professionals: Professional[];
  suggestedWindow: TimeWindow;
  alternateWindow: TimeWindow;
}

/** Entirely fictional data. The date is generated for each demo session. */
function utcForTomorrow(now: Date, hourUtc: number): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return new Date(Date.UTC(value('year'), value('month') - 1, value('day') + 1, hourUtc)).toISOString();
}

export function createDemoFixture(now = new Date()): DemoFixture {
  const slot = { startsAt: utcForTomorrow(now, 11), endsAt: utcForTomorrow(now, 22) };
  const suggestedWindow = { startsAt: utcForTomorrow(now, 14), endsAt: utcForTomorrow(now, 15) };
  const alternateWindow = { startsAt: utcForTomorrow(now, 16), endsAt: utcForTomorrow(now, 17) };
  const support = demoService;
  const physio: Service = { id: 'demo-service-physio', name: 'Fisioterapia domiciliar', requiresCredential: true };
  const nursing: Service = { id: 'demo-service-nursing', name: 'Enfermagem domiciliar', requiresCredential: true };
  const speech: Service = { id: 'demo-service-speech', name: 'Fonoaudiologia domiciliar', requiresCredential: true };
  const company: Service = { id: 'demo-service-company', name: 'Companhia e bem-estar', requiresCredential: false };
  const availability = () => [{ ...slot }];
  const professionals: Professional[] = [
    { id: 'demo-professional-a', userId: 'demo-pro-a', displayName: 'Marina Azevedo', serviceIds: [support.id, company.id], regionCodes: ['DEMO-CENTRO', 'DEMO-ZONA-SUL'], credentialStatus: 'unverified', availability: availability(), hourlyPriceCents: 7800, accessibilityTags: ['mobilidade'] },
    { id: 'demo-professional-b', userId: 'demo-pro-b', displayName: 'Caio Martins', serviceIds: [support.id, physio.id], regionCodes: ['DEMO-CENTRO', 'DEMO-ZONA-OESTE'], credentialStatus: 'verified', availability: availability(), hourlyPriceCents: 11000, accessibilityTags: ['mobilidade', 'comunicacao'] },
    { id: 'demo-professional-c', userId: 'demo-pro-c', displayName: 'Lia Ferreira', serviceIds: [support.id, company.id], regionCodes: ['DEMO-ZONA-SUL'], credentialStatus: 'unverified', availability: availability(), hourlyPriceCents: 6900, accessibilityTags: ['comunicacao'] },
    { id: 'demo-professional-d', userId: 'demo-pro-d', displayName: 'Nina Ribeiro', serviceIds: [physio.id], regionCodes: ['DEMO-CENTRO', 'DEMO-ZONA-OESTE'], credentialStatus: 'verified', availability: availability(), hourlyPriceCents: 9500, accessibilityTags: [] }
  ];
  return {
    users: [
      { id: 'demo-contractor', displayName: 'Lucas', roles: ['recipient', 'contractor'] },
      ...professionals.map((professional): User => ({ id: professional.userId, displayName: professional.displayName.split(' ')[0] ?? professional.displayName, roles: ['professional'] })),
      { id: 'demo-family', displayName: 'Rafa', roles: ['contractor'] }
    ],
    recipient: { id: 'demo-recipient', ownerUserId: 'demo-contractor', displayName: 'Lucas' },
    memberships: [{ id: 'demo-membership-family', recipientId: 'demo-recipient', userId: 'demo-family', canBook: false, canViewSchedule: true, revokedAt: null }],
    services: [support, physio, nursing, speech, company],
    professionals,
    suggestedWindow,
    alternateWindow
  };
}
