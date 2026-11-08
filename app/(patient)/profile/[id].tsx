import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../src/components/ui/Button';
import { Avatar, Badge, Screen, StateMessage } from '../../../src/components/ui/Primitives';
import { evaluateProfessional } from '../../../src/domain/rules/matching.ts';
import type { CareRequest, TimeWindow } from '../../../src/domain/types/index.ts';
import { useDemo } from '../../../src/features/demo/DemoContext';
import { portraitFor } from '../../../src/features/demo/portraits';
import { money, regionLabel, windowLabel } from '../../../src/features/demo/format';
import { theme } from '../../../src/theme/tokens';

export default function ProfessionalProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { engine, activeUserId, search, setSearch } = useDemo();
  const professional = engine.fixture.professionals.find(item => item.id === id);
  const service = engine.fixture.services.find(item => item.id === search.serviceId);
  if (!professional || !service) return <Screen back title="Perfil indisponível"><StateMessage title="Perfil não encontrado" message="Volte à busca e escolha outro profissional." /></Screen>;
  const requestFor = (window: TimeWindow): CareRequest => ({ id: 'demo-preview', recipientId: engine.fixture.recipient.id,
    requesterUserId: activeUserId ?? '', serviceId: service.id, regionCode: search.regionCode,
    startsAt: window.startsAt, endsAt: window.endsAt, requiredAccessibilityTags: search.accessibilityTags,
    maxPriceCents: search.maxPriceCents });
  const evaluation = evaluateProfessional(requestFor(search.window), service, professional);
  const slots = [engine.fixture.suggestedWindow, engine.fixture.alternateWindow].filter(window => evaluateProfessional(requestFor(window), service, professional).eligible);
  const pickSlot = (window: TimeWindow) => setSearch({ ...search, window });
  return <Screen header={false} footer={false}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar aos profissionais" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={theme.colors.ink} /></Pressable><Text accessibilityRole="header" style={styles.headerTitle}>Perfil profissional</Text></View>
    <View style={styles.identity}><Avatar name={professional.displayName} source={portraitFor(professional.id)} size={72} /><Text accessibilityRole="header" style={styles.name}>{professional.displayName}</Text><Text style={styles.muted}>{service.name} · Atendimento em casa</Text><Text style={styles.muted}>{professional.regionCodes.map(regionLabel).join(' · ')}</Text>
      <View style={styles.badges}><Badge label="Ainda sem avaliações" tone="neutral" /></View></View>
    <View style={styles.section}><Text accessibilityRole="header" style={styles.sectionTitle}>Horários disponíveis</Text><Text style={styles.muted}>{regionLabel(search.regionCode)} · {windowLabel(search.window).split('·')[0]?.trim()}</Text>
      {slots.length ? <View style={styles.slots}>{slots.map(window => <Pressable key={window.startsAt} accessibilityRole="button" accessibilityLabel={`Selecionar ${windowLabel(window)}`} accessibilityState={{ selected: search.window.startsAt === window.startsAt }} onPress={() => pickSlot(window)} style={[styles.slot, search.window.startsAt === window.startsAt && styles.slotSelected]}><Ionicons name="time-outline" size={17} color={theme.colors.ink} /><Text style={styles.slotText}>{windowLabel(window).split('·')[1]?.trim()}</Text></Pressable>)}</View> : <StateMessage title="Sem horários para este perfil" message="Ajuste serviço, região, data ou preço para continuar." action="Ajustar busca" onAction={() => router.push('/(patient)/results')} />}</View>
    <View style={styles.section}><Text accessibilityRole="header" style={styles.sectionTitle}>Sobre esta escolha</Text><View style={styles.info}><Text style={styles.infoText}>{evaluation.eligible ? 'Compatível com serviço, região e horário selecionados.' : evaluation.reasons.join(' · ')}</Text><Text style={styles.infoNote}>Compatibilidade administrativa. Não representa recomendação ou avaliação clínica.</Text></View></View>
    <View style={styles.priceRow}><View><Text style={styles.price}>{money(professional.hourlyPriceCents)} <Text style={styles.perHour}>/ hora</Text></Text><Text style={styles.muted}>Deslocamento incluído</Text></View></View>
    <Button label="Revisar solicitação" disabled={!evaluation.eligible} onPress={() => router.push(`/(patient)/request/${professional.id}`)} />
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: 11, backgroundColor: theme.colors.surface }, headerTitle: { color: theme.colors.ink, fontSize: 21, fontWeight: '700' },
  identity: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, alignItems: 'center', padding: 20, gap: 6 }, name: { color: theme.colors.ink, fontSize: 23, lineHeight: 29, fontWeight: '700', textAlign: 'center' }, muted: { color: theme.colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' }, badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginTop: 6 },
  section: { gap: 10 }, sectionTitle: { color: theme.colors.ink, fontSize: 18, lineHeight: 24, fontWeight: '700' }, slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, slot: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, borderRadius: 11, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface }, slotSelected: { backgroundColor: theme.colors.accent, borderColor: theme.colors.ink }, slotText: { color: theme.colors.ink, fontSize: 14, fontWeight: '700' },
  info: { borderRadius: 14, backgroundColor: theme.colors.surfaceMuted, padding: 15, gap: 7 }, infoText: { color: theme.colors.ink, fontSize: 14, lineHeight: 20 }, infoNote: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 }, priceRow: { borderTopWidth: 1, borderColor: theme.colors.line, paddingTop: 16, alignItems: 'center' }, price: { color: theme.colors.ink, fontSize: 24, fontWeight: '700', textAlign: 'center' }, perHour: { color: theme.colors.muted, fontSize: 14, fontWeight: '400' }
});
