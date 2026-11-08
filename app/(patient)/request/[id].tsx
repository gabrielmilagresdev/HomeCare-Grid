import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button } from '../../../src/components/ui/Button';
import { Avatar, Screen, StateMessage } from '../../../src/components/ui/Primitives';
import { evaluateProfessional } from '../../../src/domain/rules/matching.ts';
import { quoteVisit } from '../../../src/domain/rules/payments.ts';
import type { CareRequest } from '../../../src/domain/types/index.ts';
import { useDemo } from '../../../src/features/demo/DemoContext';
import { money, windowLabel } from '../../../src/features/demo/format';
import { demoLocationForRegion } from '../../../src/features/demo/locations';
import { LocationSelector } from '../../../src/features/marketplace/LocationSelector';
import { createDemoKey } from '../../../src/services/demo/ids.ts';
import { theme } from '../../../src/theme/tokens';

export default function RequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const largeText = useWindowDimensions().fontScale >= 1.4;
  const { engine, user, activeUserId, search, setSearch, request } = useDemo();
  const [error, setError] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const key = useRef<string | null>(null);
  const inFlight = useRef(false);
  const professional = engine.fixture.professionals.find(item => item.id === id);
  const service = engine.fixture.services.find(item => item.id === search.serviceId);
  const memberships = engine.getMemberships(activeUserId ?? '');
  const canBook = activeUserId === engine.fixture.recipient.ownerUserId || (memberships.ok && memberships.data.some(item => item.userId === activeUserId && item.canBook && item.revokedAt === null));
  if (!professional || !service) return <Screen back title="Solicitação"><StateMessage title="Seleção indisponível" message="Volte à busca para escolher um profissional." /></Screen>;
  const location = demoLocationForRegion(search.regionCode);
  const quote = quoteVisit(professional.hourlyPriceCents, search.window, location.travelCents);
  const draft: CareRequest = { id: 'demo-preview', recipientId: engine.fixture.recipient.id, requesterUserId: activeUserId ?? '', serviceId: service.id,
    regionCode: search.regionCode, startsAt: search.window.startsAt, endsAt: search.window.endsAt,
    requiredAccessibilityTags: search.accessibilityTags, maxPriceCents: search.maxPriceCents };
  const evaluation = evaluateProfessional(draft, service, professional);
  const submit = () => {
    if (inFlight.current || !canBook || !evaluation.eligible || !quote.ok) return;
    inFlight.current = true;
    setSubmitting(true);
    setError('');
    if (!key.current) key.current = createDemoKey();
    const input: CareRequest = { ...draft, id: key.current };
    const result = request(input, professional.id, key.current);
    inFlight.current = false;
    setSubmitting(false);
    if (!result.ok) { setError(result.error.message); return; }
    router.replace('/(patient)/bookings');
  };
  return <Screen header={false} footer={false} compact bottom={<View style={styles.sticky}><Button label={quote.ok ? `${largeText ? 'Simular pedido' : 'Simular solicitação'} · ${money(quote.data.totalCents)}` : 'Simular solicitação'} loading={submitting} disabled={!canBook || !evaluation.eligible || !quote.ok} onPress={submit} /><Text style={styles.stickyNote}>Sem cobrança. O pedido ficará aguardando aceite do profissional.</Text></View>}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar ao perfil" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={theme.colors.ink} /></Pressable><View><Text style={styles.headerTitle}>Revisar agendamento</Text><Text style={styles.headerCaption}>Última etapa</Text></View></View>
    <View style={styles.intro}><Text accessibilityRole="header" style={styles.title}>Confira sua visita</Text><Text style={styles.body}>Você pode alterar os detalhes abaixo antes de enviar.</Text></View>
    <View style={styles.summary}><View style={styles.professional}><Avatar name={professional.displayName} size={48} /><View style={styles.professionalText}><Text style={styles.professionalName}>{professional.displayName}</Text><Text style={styles.body}>{service.name} · {quote.ok ? `${quote.data.durationMinutes} min` : 'Duração indisponível'}</Text><Text style={styles.micro}>Ainda sem avaliações</Text></View></View>
      <View style={[styles.detail, largeText && styles.detailLarge]}><View style={styles.dateBlock}><Text style={styles.dateDay}>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(search.window.startsAt))}</Text><Text style={styles.dateMonth}>{new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(search.window.startsAt)).replace('.', '').toUpperCase()}</Text></View><View style={[styles.detailText, largeText && styles.detailTextLarge]}><Text style={styles.label}>DATA E HORÁRIO</Text><Text style={styles.value}>{windowLabel(search.window)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Alterar data e horário" onPress={() => router.back()} style={[styles.alter, largeText && styles.alterLarge]}><Text style={styles.alterText}>Alterar</Text></Pressable></View>
      <View style={styles.detail}><View style={styles.detailIcon}><Ionicons name="person-outline" size={21} color={theme.colors.ink} /></View><View style={styles.detailText}><Text style={styles.label}>PESSOA ATENDIDA</Text><Text style={styles.value}>{engine.fixture.recipient.displayName}</Text><Text style={styles.micro}>Único perfil disponível nesta demonstração</Text></View></View>
      <View style={[styles.detail, largeText && styles.detailLarge]}><View style={styles.detailIcon}><Ionicons name="location-outline" size={21} color={theme.colors.ink} /></View><View style={[styles.detailText, largeText && styles.detailTextLarge]}><Text style={styles.label}>ENDEREÇO</Text><Text style={styles.value}>{location.label}</Text><Text style={styles.body}>{location.fullAddress}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Alterar endereço" accessibilityState={{ expanded: editingAddress }} onPress={() => setEditingAddress(!editingAddress)} style={[styles.alter, largeText && styles.alterLarge]}><Text style={styles.alterText}>Alterar</Text></Pressable></View>
      {editingAddress && <View style={styles.addressChoices}><LocationSelector regionCode={search.regionCode} initiallyExpanded onSelect={regionCode => { setSearch({ ...search, regionCode }); setEditingAddress(false); setError(''); }} /></View>}
    </View>
    {!evaluation.eligible && <StateMessage title="Escolha outro horário ou local" message={evaluation.reasons.join(' · ')} action="Voltar aos profissionais" onAction={() => router.push('/(patient)/results')} />}
    <View style={styles.priceCard}><Text accessibilityRole="header" style={styles.sectionTitle}>Resumo demonstrativo</Text><View style={styles.priceLine}><Text style={styles.body}>Atendimento</Text><Text style={styles.priceValue}>{quote.ok ? money(quote.data.attendanceCents) : '—'}</Text></View><View style={styles.priceLine}><Text style={styles.body}>Deslocamento</Text><Text style={styles.priceValue}>{quote.ok ? money(quote.data.travelCents) : '—'}</Text></View><View style={styles.totalLine}><Text style={styles.totalLabel}>Total demonstrativo</Text><Text style={styles.totalValue}>{quote.ok ? money(quote.data.totalCents) : '—'}</Text></View><Text style={styles.micro}>Sem meio de pagamento configurado ou cobrança. Valores fictícios.</Text></View>
    <View style={styles.info}><Ionicons name="information-circle-outline" size={21} color={theme.colors.ink} /><Text style={styles.infoText}>Esta ação cria apenas um pedido pendente na demonstração. A confirmação da visita depende do aceite do profissional. Política de cancelamento e pagamento ainda não estão disponíveis.</Text></View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!canBook && <StateMessage icon="lock-closed-outline" title="Permissão necessária" message={user ? 'Este perfil não pode solicitar para a pessoa selecionada.' : 'Escolha um papel antes de solicitar.'} action="Escolher papel" onAction={() => router.push('/(auth)/sign-in')} />}
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 44, height: 44, borderRadius: 11, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong, alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: '700' }, headerCaption: { color: theme.colors.muted, fontSize: 13, marginTop: 2 }, intro: { gap: 6 }, title: { color: theme.colors.ink, fontSize: 27, lineHeight: 34, fontWeight: '700', letterSpacing: -0.6 }, body: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  summary: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, padding: 14 }, professional: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 12 }, professionalText: { flex: 1, gap: 2 }, professionalName: { color: theme.colors.ink, fontSize: 16, fontWeight: '700' }, micro: { color: theme.colors.muted, fontSize: 12, lineHeight: 17 }, detail: { flexDirection: 'row', alignItems: 'center', gap: 11, borderTopWidth: 1, borderColor: theme.colors.line, minHeight: 76, paddingVertical: 10 }, detailLarge: { flexWrap: 'wrap' }, dateBlock: { width: 47, height: 50, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }, dateDay: { color: theme.colors.ink, fontSize: 21, lineHeight: 23, fontWeight: '700' }, dateMonth: { color: theme.colors.ink, fontSize: 10, fontWeight: '700' }, detailIcon: { width: 47, alignItems: 'center' }, detailText: { flex: 1, gap: 4 }, detailTextLarge: { flexBasis: 160, flexGrow: 1 }, label: { color: theme.colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.7 }, value: { color: theme.colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' }, alter: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }, alterLarge: { width: '100%', alignItems: 'flex-end' }, alterText: { color: theme.colors.ink, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }, addressChoices: { paddingVertical: 12, borderTopWidth: 1, borderColor: theme.colors.line },
  priceCard: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, padding: 14, gap: 8 }, sectionTitle: { color: theme.colors.ink, fontSize: 18, lineHeight: 24, fontWeight: '700' }, priceLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, priceValue: { color: theme.colors.ink, fontSize: 14, fontWeight: '600' }, totalLine: { borderTopWidth: 1, borderColor: theme.colors.line, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, totalLabel: { color: theme.colors.ink, fontSize: 15, fontWeight: '700' }, totalValue: { color: theme.colors.ink, fontSize: 22, fontWeight: '700' }, info: { flexDirection: 'row', gap: 9, borderRadius: 12, backgroundColor: theme.colors.surfaceMuted, padding: 14 }, infoText: { flex: 1, color: theme.colors.ink, fontSize: 13, lineHeight: 19 }, error: { color: theme.colors.error, fontSize: 13, lineHeight: 19 }, sticky: { backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.line, paddingHorizontal: 20, paddingVertical: 10, gap: 5 }, stickyNote: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' }
});
