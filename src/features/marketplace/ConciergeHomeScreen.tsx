import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import { Avatar, Brand, Divider, Screen, SectionTitle } from '../../components/ui/Primitives';
import { useDemo } from '../demo/DemoContext';
import { portraitFor } from '../demo/portraits';
import { demoLocationForRegion } from '../demo/locations';
import { statusLabel, windowLabel } from '../demo/format';
import { LocationSelector } from './LocationSelector';
import { theme } from '../../theme/tokens';

const highlightedServices = [
  { id: 'demo-service-physio', name: 'Fisioterapia', icon: 'body-outline' },
  { id: 'demo-service-nursing', name: 'Enfermagem', icon: 'medkit-outline' },
  { id: 'demo-service-speech', name: 'Fonoaudiologia', icon: 'chatbubble-ellipses-outline' }
] as const;

function greeting(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(now));
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
}

export function ConciergeHomeScreen() {
  const { engine, user, activeUserId, search, setSearch, intent, setIntent, applyIntent, chooseService } = useDemo();
  const { width, fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  const narrow = width < 360 || largeText;
  const [message, setMessage] = useState('');
  const [now] = useState(() => new Date());
  const agenda = engine.listForRecipient(activeUserId ?? '');
  const next = agenda.ok ? agenda.data.filter(booking => booking.status === 'accepted' && Date.parse(booking.startsAt) >= now.getTime())
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0] : undefined;
  const nextProfessional = next ? engine.fixture.professionals.find(item => item.id === next.professionalId) : undefined;
  const nextRequest = next ? engine.getRequest(activeUserId ?? '', next.id) : undefined;
  const nextService = nextRequest?.ok ? engine.fixture.services.find(item => item.id === nextRequest.data.serviceId) : undefined;
  const location = demoLocationForRegion(search.regionCode);
  const submit = (text: string) => {
    const result = applyIntent(text);
    if (!result.ok) { setMessage(result.error.message); return; }
    setMessage('');
    router.push('/(patient)/results');
  };
  const openService = (id: string) => { chooseService(id); router.push('/(patient)/results'); };
  return <Screen header={false} footer={false} compact bottom={<BottomNavigation active="home" />}>
    <View style={styles.header}><Brand /><Pressable accessibilityRole="button" accessibilityLabel="Abrir conta" onPress={() => router.push('/(auth)/sign-in')} style={styles.account}><Avatar name={user?.displayName ?? 'Conta'} tone="peach" size={40} /></Pressable></View>
    <LocationSelector regionCode={search.regionCode} onSelect={regionCode => setSearch({ ...search, regionCode })} />
    <View style={styles.hairline} />
    <View style={styles.intro}><Text style={styles.greeting}>{greeting(now)}{user ? `, ${user.displayName}` : ''}</Text><Text accessibilityRole="header" style={styles.title}>Como podemos ajudar?</Text></View>
    <View style={styles.composer}><TextInput accessibilityLabel="Descreva o cuidado que procura" multiline value={intent} onChangeText={setIntent} maxLength={500}
      placeholder="Descreva o cuidado que procura" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
      <View style={styles.composerDivider} /><View style={styles.composerBottom}><View style={styles.composerHintRow}><Ionicons name="chatbubble-outline" size={16} color={theme.colors.muted} /><Text style={[styles.composerHint, largeText && styles.composerHintLarge]}>Texto ou áudio</Text></View><View style={styles.composerActions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Entrada por voz" accessibilityHint="Informa se há transcrição disponível" onPress={() => setMessage('A entrada por voz não está disponível neste dispositivo. Use o texto para continuar.')} style={styles.mic}><Ionicons name="mic-outline" size={21} color={theme.colors.white} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar cuidado" accessibilityState={{ disabled: !intent.trim() }} disabled={!intent.trim()} onPress={() => submit(intent)} style={[styles.send, !intent.trim() && styles.sendDisabled]}><Ionicons name="arrow-forward" size={22} color={theme.colors.ink} /></Pressable>
      </View></View>
    </View>
    {!!message && <Text accessibilityRole="alert" style={styles.message}>{message}</Text>}
    <View style={[styles.suggestionRow, narrow && styles.suggestionRowNarrow]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fisioterapia" onPress={() => submit('Fisioterapia')} style={[styles.suggestion, narrow && styles.suggestionNarrow]}><Ionicons name="body-outline" size={18} color={theme.colors.ink} /><Text style={styles.suggestionText}>Fisioterapia</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.ink} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Pós-operatório" onPress={() => submit('Pós-operatório')} style={[styles.suggestion, narrow && styles.suggestionNarrow]}><Ionicons name="medkit-outline" size={18} color={theme.colors.ink} /><Text style={styles.suggestionText}>Pós-operatório</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.ink} /></Pressable>
    </View>
    <View style={styles.section}><View style={[styles.sectionHead, largeText && styles.sectionHeadLarge]}><SectionTitle title="Cuidados em casa" /><Pressable accessibilityRole="button" onPress={() => router.push('/(patient)/results')} style={styles.textAction}><Text style={styles.textActionLabel}>Ver todos</Text><Ionicons name="arrow-forward" size={16} color={theme.colors.ink} /></Pressable></View>
      <View style={[styles.services, narrow && styles.servicesNarrow]}>{highlightedServices.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Buscar ${item.name}`} onPress={() => openService(item.id)} style={[styles.service, narrow && styles.serviceNarrow]}>
        <View style={styles.serviceIcon}><Ionicons name={item.icon} size={23} color={theme.colors.ink} /></View><Text style={[styles.serviceName, narrow && styles.serviceNameNarrow]}>{item.name}</Text>{narrow && <Ionicons name="chevron-forward" size={17} color={theme.colors.ink} />}
      </Pressable>)}</View></View>
    {next && <View style={styles.section}><SectionTitle title="Próxima visita" /><Pressable accessibilityRole="button" accessibilityLabel="Abrir próximo atendimento" onPress={() => router.push('/(patient)/bookings')} style={styles.visit}>
      <View style={styles.visitTop}><View style={styles.dateBlock}><Text style={styles.dateDay}>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(next.startsAt))}</Text><Text style={styles.dateMonth}>{new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(next.startsAt)).replace('.', '').toUpperCase()}</Text></View>
        <View style={styles.visitInfo}><Text style={styles.visitTime}>{windowLabel(next)}</Text><Text style={styles.visitService}>{nextService?.name ?? 'Atendimento'} · Para {activeUserId === engine.fixture.recipient.ownerUserId ? 'você' : engine.fixture.recipient.displayName}</Text></View></View>
      <Divider /><View style={styles.visitBottom}><Avatar name={nextProfessional?.displayName ?? 'Profissional'} source={portraitFor(nextProfessional?.id)} size={38} /><View style={{ flex: 1 }}><Text style={styles.visitName}>{nextProfessional?.displayName ?? 'Profissional'}</Text><Text style={styles.visitStatus}>{statusLabel[next.status]}</Text></View><Ionicons name="chevron-forward" size={19} color={theme.colors.ink} /></View>
    </Pressable></View>}
    <Pressable accessibilityRole="button" accessibilityLabel="Abrir área da família" onPress={() => router.push('/(family)/schedule')} style={styles.family}>
      <View style={styles.familyAvatars}><Avatar name={user?.displayName ?? 'Você'} size={34} /><View style={styles.familyOverlap}><Avatar name="Rafa" size={34} tone="blue" /></View></View>
      <Text style={styles.familyText}>Organize o cuidado da família</Text><Ionicons name="arrow-forward" size={19} color={theme.colors.ink} />
    </Pressable>
    <Text style={styles.demoNote}>Atendimento em {location.neighborhood}, São Paulo</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, account: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
  hairline: { height: 1, backgroundColor: theme.colors.line }, intro: { gap: 8 }, greeting: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 }, title: { color: theme.colors.ink, fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.8 },
  composer: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, overflow: 'hidden' }, input: { minHeight: 78, paddingHorizontal: 17, paddingTop: 16, paddingBottom: 10, color: theme.colors.ink, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' }, composerDivider: { height: 1, backgroundColor: theme.colors.line, marginHorizontal: 12 }, composerBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 9 }, composerHintRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, composerHint: { color: theme.colors.muted, fontSize: 13 }, composerHintLarge: { fontSize: 11 }, composerActions: { flexDirection: 'row', gap: 8 }, mic: { width: 44, height: 44, borderRadius: 11, backgroundColor: theme.colors.ink, alignItems: 'center', justifyContent: 'center' }, send: { width: 44, height: 44, borderRadius: 11, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: 0.45 }, message: { color: theme.colors.error, fontSize: 13, lineHeight: 19 },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, suggestionRowNarrow: { flexDirection: 'column' }, suggestion: { flexGrow: 1, minWidth: 145, minHeight: 48, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: 11, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11 }, suggestionNarrow: { flexGrow: 0, alignSelf: 'stretch', width: '100%', minWidth: 0, minHeight: 56 }, suggestionText: { flex: 1, color: theme.colors.ink, fontSize: 14, fontWeight: '600' },
  section: { gap: 12 }, sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionHeadLarge: { flexDirection: 'column', alignItems: 'flex-start' }, textAction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 }, textActionLabel: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' }, services: { flexDirection: 'row', gap: 9 }, servicesNarrow: { flexDirection: 'column' }, service: { flex: 1, minWidth: 0, minHeight: 106, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8 }, serviceNarrow: { flex: 0, minHeight: 64, flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 12 }, serviceIcon: { width: 39, height: 39, borderRadius: 11, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, serviceName: { color: theme.colors.ink, textAlign: 'center', fontSize: 12, lineHeight: 16, fontWeight: '700' }, serviceNameNarrow: { flex: 1, textAlign: 'left', fontSize: 13 },
  visit: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, padding: 16, gap: 14 }, visitTop: { flexDirection: 'row', gap: 12, alignItems: 'center' }, dateBlock: { width: 51, height: 55, backgroundColor: theme.colors.accent, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, dateDay: { color: theme.colors.ink, fontSize: 22, fontWeight: '700', lineHeight: 24 }, dateMonth: { color: theme.colors.ink, fontSize: 11, fontWeight: '700' }, visitInfo: { flex: 1, gap: 4 }, visitTime: { color: theme.colors.ink, fontSize: 14, fontWeight: '700' }, visitService: { color: theme.colors.muted, fontSize: 13, lineHeight: 18 }, visitBottom: { flexDirection: 'row', alignItems: 'center', gap: 9 }, visitName: { color: theme.colors.ink, fontSize: 14, fontWeight: '700' }, visitStatus: { color: theme.colors.success, fontSize: 12 },
  family: { minHeight: 68, borderWidth: 1, borderRadius: 14, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, familyAvatars: { flexDirection: 'row', width: 57 }, familyOverlap: { marginLeft: -11 }, familyText: { color: theme.colors.ink, fontSize: 14, fontWeight: '600', flex: 1 }, demoNote: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' }
});
