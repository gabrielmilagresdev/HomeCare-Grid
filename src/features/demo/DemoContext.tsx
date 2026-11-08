import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Booking, BookingStatus, CareRequest, FamilyMembership, ID, Result, TimeWindow, UnservedDemand, User } from '../../domain/types/index.ts';
import { DemoEngine } from '../../services/demo/engine.ts';

export interface SearchFilters { serviceId: ID; regionCode: string; window: TimeWindow; accessibilityTags: string[]; maxPriceCents: number | null }
interface DemoContextValue {
  engine: DemoEngine; user: User | null; activeUserId: ID | null; setActiveUserId: (id: ID | null) => void;
  search: SearchFilters; setSearch: (value: SearchFilters) => void; revision: number;
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
  const [revision, setRevision] = useState(0);
  const bump = () => setRevision(value => value + 1);
  const user = instance.fixture.users.find(item => item.id === activeUserId) ?? null;
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
  return <Context.Provider value={{ engine: instance, user, activeUserId, setActiveUserId, search, setSearch, revision, request, transition, setPermission, recordDemand, revokeConsent }}>{children}</Context.Provider>;
}

export function useDemo(): DemoContextValue {
  const value = useContext(Context);
  if (!value) throw new Error('DemoProvider ausente');
  return value;
}
