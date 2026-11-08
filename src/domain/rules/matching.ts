import type { CareRequest, Match, MatchEvaluation, Professional, Service } from '../types/index.ts';
import { isTimeWindow } from '../schemas/index.ts';
/** Elegibilidade administrativa. Sem inferência de qualidade clínica ou LLM. */
export function evaluateProfessional(request: CareRequest, service: Service, professional: Professional): MatchEvaluation {
  const reasons: string[] = [];
  if (!isTimeWindow(request)) reasons.push('Período da busca inválido');
  if (request.serviceId !== service.id) reasons.push('Serviço da busca inválido');
  if (!professional.serviceIds.includes(service.id)) reasons.push('Serviço não oferecido');
  if (!professional.regionCodes.includes(request.regionCode)) reasons.push('Região não atendida');
  if (service.requiresCredential && professional.credentialStatus !== 'verified') reasons.push('Credencial exigida não verificada');
  if (!Number.isSafeInteger(professional.hourlyPriceCents) || professional.hourlyPriceCents < 0) reasons.push('Valor do perfil inválido');
  if (request.maxPriceCents !== null && (!Number.isSafeInteger(request.maxPriceCents) || request.maxPriceCents < 0)) reasons.push('Limite de valor inválido');
  else if (request.maxPriceCents !== null && professional.hourlyPriceCents > request.maxPriceCents) reasons.push('Valor acima do limite informado');
  if (!request.requiredAccessibilityTags.every(tag => professional.accessibilityTags.includes(tag))) reasons.push('Acessibilidade solicitada não disponível');
  if (!professional.availability.some(slot => isTimeWindow(slot) && Date.parse(slot.startsAt) <= Date.parse(request.startsAt) && Date.parse(slot.endsAt) >= Date.parse(request.endsAt))) reasons.push('Horário não disponível');
  if (reasons.length) return { eligible: false, reasons };
  return { eligible: true, reasons: ['Serviço disponível', 'Região atendida', 'Horário compatível', ...(service.requiresCredential ? ['Credencial verificada na fonte de dados'] : []), 'Ordenação por preço; desempate por identificador'] };
}

export function rankProfessionals(request: CareRequest, service: Service, professionals: readonly Professional[]): Match[] {
  return professionals.flatMap(professional => {
    const evaluation = evaluateProfessional(request, service, professional);
    return evaluation.eligible ? [{ professionalId: professional.id, hourlyPriceCents: professional.hourlyPriceCents, reasons: evaluation.reasons }] : [];
  }).sort((a, b) => a.hourlyPriceCents - b.hourlyPriceCents || (a.professionalId < b.professionalId ? -1 : a.professionalId > b.professionalId ? 1 : 0));
}
