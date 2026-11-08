import type { ConciergeFilters, Result } from '../../domain/types/index.ts';
import { parseConciergeFilters } from '../../domain/schemas/index.ts';
import type { DemoFixture } from '../../testing/fixtures.ts';

/** Offline fallback: extracts only administrative filters, never clinical advice. */
export function interpretDemoConcierge(text: string, fixture: DemoFixture): Result<ConciergeFilters> {
  if (!text.trim() || text.length > 500) return { ok: false, error: { code: 'validation', message: 'Descreva o serviço e a região em até 500 caracteres.' } };
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const serviceId = normalized.includes('fisio') ? 'demo-service-physio'
    : normalized.includes('companh') || normalized.includes('bem-estar') ? 'demo-service-company'
      : normalized.includes('apoio') || normalized.includes('cuidado') ? 'demo-service-support' : null;
  const regionCode = normalized.includes('centro') ? 'DEMO-CENTRO'
    : normalized.includes('zona sul') || normalized.includes('sul') ? 'DEMO-ZONA-SUL'
      : normalized.includes('zona oeste') || normalized.includes('oeste') ? 'DEMO-ZONA-OESTE'
        : normalized.includes('zona norte') || normalized.includes('norte') ? 'DEMO-ZONA-NORTE' : null;
  const hasTime = /amanha|manha|tarde|\b1[0-9]h\b/.test(normalized);
  const unsupportedDate = /hoje|semana|mes|urgente/.test(normalized);
  const window = !hasTime || unsupportedDate ? null : normalized.includes('tarde') ? fixture.alternateWindow : fixture.suggestedWindow;
  return parseConciergeFilters({ serviceId, regionCode, window, frequency: null, accessibilityTags: [], clarificationNeeded: !serviceId || !regionCode || !window },
    fixture.services.map(item => item.id), ['DEMO-CENTRO', 'DEMO-ZONA-SUL', 'DEMO-ZONA-OESTE', 'DEMO-ZONA-NORTE']);
}
