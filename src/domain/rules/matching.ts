import type { CareRequest, Match, Professional, Service } from '../types/index.ts';
import { isTimeWindow } from '../schemas/index.ts';
/** Elegibilidade administrativa. Sem inferência de qualidade clínica ou LLM. */
export function rankProfessionals(request: CareRequest, service: Service, professionals: readonly Professional[]): Match[] {
  if (!isTimeWindow(request) || request.serviceId !== service.id) return [];
  return professionals.filter(p =>
    p.serviceIds.includes(service.id) && p.regionCodes.includes(request.regionCode) &&
    (!service.requiresCredential || p.credentialStatus === 'verified') &&
    Number.isSafeInteger(p.hourlyPriceCents) && p.hourlyPriceCents >= 0 &&
    (request.maxPriceCents === null || p.hourlyPriceCents <= request.maxPriceCents) &&
    request.requiredAccessibilityTags.every(tag => p.accessibilityTags.includes(tag)) &&
    p.availability.some(slot => isTimeWindow(slot) && Date.parse(slot.startsAt) <= Date.parse(request.startsAt) && Date.parse(slot.endsAt) >= Date.parse(request.endsAt))
  ).map(p => ({ professionalId: p.id, hourlyPriceCents: p.hourlyPriceCents,
    reasons: ['Serviço disponível', 'Região atendida', 'Horário compatível', ...(service.requiresCredential ? ['Credencial verificada na fonte de dados'] : []), 'Ordenação por preço; desempate por identificador']
  })).sort((a, b) => a.hourlyPriceCents - b.hourlyPriceCents || (a.professionalId < b.professionalId ? -1 : a.professionalId > b.professionalId ? 1 : 0));
}
