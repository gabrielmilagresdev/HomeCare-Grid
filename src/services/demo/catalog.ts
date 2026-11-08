import type { CatalogService } from '../contracts.ts';
import { demoProfessionals, demoService } from '../../testing/fixtures.ts';
export const demoCatalog: CatalogService = {
  async listServices() { return { ok: true, data: [{ ...demoService }] }; },
  async listProfessionals() { return { ok: true, data: demoProfessionals.map(p => ({ ...p, serviceIds: [...p.serviceIds], regionCodes: [...p.regionCodes], accessibilityTags: [...p.accessibilityTags], availability: p.availability.map(slot => ({ ...slot })) })) }; }
};
