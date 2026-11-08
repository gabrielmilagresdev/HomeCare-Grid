import type { BookingStatus, TimeWindow } from '../../domain/types/index.ts';

export const regions = [
  { code: 'DEMO-CENTRO', label: 'Centro' },
  { code: 'DEMO-ZONA-SUL', label: 'Zona Sul' },
  { code: 'DEMO-ZONA-OESTE', label: 'Zona Oeste' },
  { code: 'DEMO-ZONA-NORTE', label: 'Zona Norte' }
] as const;

export const regionLabel = (code: string) => regions.find(item => item.code === code)?.label ?? code;
export const money = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit', month: 'short' });
const time = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false });
export const windowLabel = (window: TimeWindow) => `${date.format(new Date(window.startsAt))} · ${time.format(new Date(window.startsAt))}–${time.format(new Date(window.endsAt))}`;
export const statusLabel: Record<BookingStatus, string> = {
  requested: 'Aguardando aceite', accepted: 'Confirmado', rejected: 'Recusado', cancelled: 'Cancelado', completed: 'Concluído'
};
