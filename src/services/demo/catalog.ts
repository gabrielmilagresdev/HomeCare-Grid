import type { CatalogService } from '../contracts.ts';
import { demoProfessionals, demoService } from '../../testing/fixtures.ts';
export const demoCatalog: CatalogService = {
  async listServices() { return { ok: true, data: structuredClone([demoService]) }; },
  async listProfessionals() { return { ok: true, data: structuredClone(demoProfessionals) }; }
};
