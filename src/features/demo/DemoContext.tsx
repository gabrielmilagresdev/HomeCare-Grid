import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import type { Booking, BookingStatus, CareRequest, ConciergeFilters, FamilyMembership, ID, Result, TimeWindow, UnservedDemand, User } from '../../domain/types/index.ts';
import { DemoEngine } from '../../services/demo/engine.ts';
import { interpretDemoConcierge } from '../../services/demo/concierge.ts';
import { interpretRemoteConcierge, remoteConciergeConfigured } from '../../services/ai/concierge.ts';

export interface SearchFilters { serviceId: ID; regionCode: string; window: TimeWindow; accessibilityTags: string[]; maxPriceCents: number | null }
interface DemoContextValue {
  engine: DemoEngine; user: User | null; activeUserId: ID | null; setActiveUserId: (id: ID | null) => void;
  search: SearchFilters; setSearch: (value: SearchFilters) => void; revision: number;
  intent: string; setIntent: (value: string) => void; conciergeNotice: string;
  conciergeReply: string;
  serviceChoiceRequired: boolean; chooseService: (serviceId: ID) => void;
  applyIntent: (text: string) => Result<ConciergeFilters>;
  suggestIntent: (text: string) => Promise<Result<ConciergeFilters>>;
  request: (input: CareRequest, professionalId: ID, key: string) => Result<Booking>;
  transition: (bookingId: ID, to: BookingStatus, version: number) => Result<Booking>;
  setPermission: (userId: ID, permission: 'canBook' | 'canViewSchedule' | 'revoke', enabled?: boolean) => Result<FamilyMembership>;
  recordDemand: (serviceId: ID, regionCode: string, consent: boolean) => Result<UnservedDemand>;
  revokeConsent: () => void;
}
const Context = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(() => new DemoEngine());
  const [activeUserId, setActiveUserId] = useState<ID | null>('demo-contractor');
  const [search, setSearch] = useState<SearchFilters>({ serviceId: instance.fixture.services[0]?.id ?? '', regionCode: 'DEMO-CENTRO', window: instance.fixture.suggestedWindow, accessibilityTags: [], maxPriceCents: null });
  const [intent, setIntentState] = useState('');
  const intentRequest = useRef(0);
  const setIntent = (value: string) => { intentRequest.current += 1; setIntentState(value); setConciergeReply(''); };
  const [conciergeNotice, setConciergeNotice] = useState('');
  const [conciergeReply, setConciergeReply] = useState('');
  const [serviceChoiceRequired, setServiceChoiceRequired] = useState(false);
  const [revision, setRevision] = useState(0);
  const bump = () => setRevision(value => value + 1);
  const user = instance.fixture.users.find(item => item.id === activeUserId) ?? null;
  const chooseService = (serviceId: ID) => {
    setSearch(current => ({ ...current, serviceId }));
    setServiceChoiceRequired(false);
    setConciergeNotice('Serviço definido. Confira região e horário antes de escolher.');
  };
  const commitFilters = (filters: ConciergeFilters, source: 'local' | 'grok' | 'fallback', reply?: string) => {
    setSearch(current => ({ ...current, serviceId: filters.serviceId ?? current.serviceId,
      regionCode: filters.regionCode ?? current.regionCode, window: filters.window ?? current.window,
      accessibilityTags: filters.accessibilityTags }));
    setServiceChoiceRequired(filters.serviceId === null);
    const serviceName = instance.fixture.services.find(item => item.id === filters.serviceId)?.name.toLowerCase();
    const region = filters.regionCode === 'DEMO-CENTRO' ? ' no Centro' : filters.regionCode === 'DEMO-ZONA-SUL' ? ' na Zona Sul'
      : filters.regionCode === 'DEMO-ZONA-OESTE' ? ' na Zona Oeste' : filters.regionCode === 'DEMO-ZONA-NORTE' ? ' na Zona Norte' : '';
    setConciergeReply(reply ?? (serviceName
      ? `Entendi que você procura ${serviceName}${region}. Posso mostrar profissionais e horários para comparar. Confira os detalhes antes de solicitar.`
      : 'Posso ajudar a encontrar cuidado em casa. Qual serviço você procura? Conte também a região e o horário de sua preferência.'));
    setConciergeNotice(source === 'fallback' ? 'Conexão indisponível. Aplicamos filtros básicos; revise antes de continuar.' : filters.serviceId === null
      ? 'Ainda precisamos definir o tipo de serviço. Escolha uma opção abaixo; não fazemos interpretação clínica.'
      : filters.clarificationNeeded ? 'Sugestão aplicada. Confira região e horário antes de continuar.'
        : source === 'grok' ? 'A TatinhIA sugeriu os filtros. Revise os detalhes antes de solicitar.'
          : 'Filtros sugeridos. Confirme os detalhes antes de solicitar.');
  };
  const applyIntent = (text: string): Result<ConciergeFilters> => {
    setIntent(text);
    const result = interpretDemoConcierge(text, instance.fixture);
    if (!result.ok) { setConciergeNotice(result.error.message); return result; }
    commitFilters(result.data, 'local');
    return result;
  };
  const suggestIntent = async (text: string): Promise<Result<ConciergeFilters>> => {
    const sequence = ++intentRequest.current;
    setIntentState(text);
    if (!remoteConciergeConfigured) return applyIntent(text);
    const remote = await interpretRemoteConcierge(text, instance.fixture);
    if (sequence !== intentRequest.current) return { ok: false, error: { code: 'conflict', message: 'A busca foi alterada. Tente novamente.' } };
    if (remote.ok) { commitFilters(remote.data, 'grok', remote.data.reply); return remote; }
    const local = interpretDemoConcierge(text, instance.fixture);
    if (!local.ok) { setConciergeNotice(local.error.message); return local; }
    commitFilters(local.data, 'fallback');
    return local;
  };
  const request = (input: CareRequest, professionalId: ID, key: string): Result<Booking> => {
    const result = instance.request(activeUserId ?? '', input, professionalId, key);
    if (result.ok) bump();
    return result;
  };
  const transition = (bookingId: ID, to: BookingStatus, version: number): Result<Booking> => {
    const result = instance.transition(activeUserId ?? '', bookingId, to, version);
    if (result.ok) bump();
    return result;
  };
  const setPermission = (userId: ID, permission: 'canBook' | 'canViewSchedule' | 'revoke', enabled = true): Result<FamilyMembership> => {
    const result = instance.setFamilyPermission(activeUserId ?? '', userId, permission, enabled);
    if (result.ok) bump();
    return result;
  };
  const recordDemand = (serviceId: ID, regionCode: string, consent: boolean): Result<UnservedDemand> => {
    const result = instance.recordUnservedDemand(activeUserId ?? '', serviceId, regionCode, consent);
    if (result.ok) bump();
    return result;
  };
  const revokeConsent = () => { instance.revokeDemandConsent(activeUserId ?? ''); bump(); };
  return <Context.Provider value={{ engine: instance, user, activeUserId, setActiveUserId, search, setSearch, revision,
    intent, setIntent, conciergeNotice, conciergeReply, serviceChoiceRequired, chooseService, applyIntent, suggestIntent,
    request, transition, setPermission, recordDemand, revokeConsent }}>{children}</Context.Provider>;
}

export function useDemo(): DemoContextValue {
  const value = useContext(Context);
  if (!value) throw new Error('DemoProvider ausente');
  return value;
}
