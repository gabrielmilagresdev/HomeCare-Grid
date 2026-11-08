import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import { Avatar, Brand, Divider, Screen, SectionTitle } from '../../components/ui/Primitives';
import { useDemo } from '../demo/DemoContext';
import { portraitFor } from '../demo/portraits';
import { demoLocationForRegion } from '../demo/locations';
import { money, statusLabel, windowLabel } from '../demo/format';
import { LocationSelector } from './LocationSelector';
import { theme } from '../../theme/tokens';
import { transcribeVoice } from '../../services/ai/voice';

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
  const { engine, user, activeUserId, search, setSearch, intent, setIntent, suggestIntent, chooseService, conciergeReply } = useDemo();
  const { width, fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  const narrow = width < 360 || largeText;
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const recordingRef = useRef(false);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const [now] = useState(() => new Date());
  const agenda = engine.listForRecipient(activeUserId ?? '');
  const next = agenda.ok ? agenda.data.filter(booking => booking.status === 'accepted' && Date.parse(booking.startsAt) >= now.getTime())
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0] : undefined;
  const nextProfessional = next ? engine.fixture.professionals.find(item => item.id === next.professionalId) : undefined;
  const nextRequest = next ? engine.getRequest(activeUserId ?? '', next.id) : undefined;
  const nextService = nextRequest?.ok ? engine.fixture.services.find(item => item.id === nextRequest.data.serviceId) : undefined;
  const featured = ['demo-professional-d', 'demo-professional-b'].map(id => engine.fixture.professionals.find(item => item.id === id)).filter(item => item !== undefined);
  const location = demoLocationForRegion(search.regionCode);
  useEffect(() => () => {
    if (recordingTimer.current) clearTimeout(recordingTimer.current);
    if (recordingRef.current) void recorder.stop().catch(() => undefined);
    void setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    Speech.stop();
  }, [recorder]);
  const submit = async (text: string) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    try {
      const result = await suggestIntent(text);
      if (!result.ok) { setMessage(result.error.message); return; }
      setMessage('');
    } finally { inFlight.current = false; setSubmitting(false); }
  };
  const stopRecording = async () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    if (recordingTimer.current) { clearTimeout(recordingTimer.current); recordingTimer.current = null; }
    setVoiceBusy(true);
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      if (!recorder.uri) throw new Error('Áudio não salvo.');
      const result = await transcribeVoice(recorder.uri);
      if (!result.ok) { setMessage(result.error.message); return; }
      setIntent(result.data);
      await submit(result.data);
    } catch {
      setMessage('Não consegui concluir a gravação. Tente novamente ou digite sua mensagem.');
    } finally { setVoiceBusy(false); }
  };
  const toggleRecording = async () => {
    if (recordingRef.current) { await stopRecording(); return; }
    if (voiceBusy || submitting) return;
    setMessage('');
    setIntent(intent);
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) { setMessage('Permita o acesso ao microfone nas configurações do aparelho para falar com a TatinhIA.'); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      recordingRef.current = true;
      recordingTimer.current = setTimeout(() => { void stopRecording(); }, 20000);
    } catch {
      setMessage('Não foi possível iniciar o microfone. Verifique a permissão e tente novamente.');
      void setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    }
  };
  const openService = (id: string) => { chooseService(id); router.push('/(patient)/results'); };
  return <Screen header={false} footer={false} compact bottom={<BottomNavigation active="home" />}>
    <View style={styles.header}><Brand /><Pressable accessibilityRole="button" accessibilityLabel="Abrir conta" onPress={() => router.push('/(auth)/sign-in')} style={styles.account}><Avatar name={user?.displayName ?? 'Conta'} tone="peach" size={40} /></Pressable></View>
    <LocationSelector regionCode={search.regionCode} onSelect={regionCode => setSearch({ ...search, regionCode })} />
    <View style={styles.hairline} />
    <View style={styles.intro}><Text style={styles.greeting}>{greeting(now)}{user ? `, ${user.displayName}` : ''}</Text><Text accessibilityRole="header" style={styles.title}>Como podemos ajudar?</Text></View>
    <View style={styles.assistantHeading}><View style={styles.assistantIcon}><Ionicons name="sparkles" size={15} color={theme.colors.ink} /></View><View><Text style={styles.assistantName}>TatinhIA</Text><Text style={styles.assistantCaption}>Escreva ou fale sobre o cuidado que procura</Text></View></View>
    <View style={styles.composer}><TextInput accessibilityLabel="Descreva o cuidado que procura" multiline value={intent} onChangeText={setIntent} maxLength={500}
      placeholder="Descreva o cuidado que procura" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
      <View style={styles.composerDivider} /><View style={styles.composerBottom}><View style={styles.composerHintRow}><Ionicons name="chatbubble-outline" size={16} color={theme.colors.muted} /><Text style={[styles.composerHint, largeText && styles.composerHintLarge]}>Serviço, região e horário</Text></View><View style={styles.composerActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={recorderState.isRecording ? 'Parar e transcrever áudio' : 'Gravar mensagem para TatinhIA'} accessibilityState={{ disabled: voiceBusy || submitting, busy: voiceBusy }} disabled={voiceBusy || submitting} onPress={() => { void toggleRecording(); }} style={[styles.mic, recorderState.isRecording && styles.micActive]}>{voiceBusy ? <ActivityIndicator color={theme.colors.white} /> : <Ionicons name={recorderState.isRecording ? 'stop' : 'mic-outline'} size={21} color={theme.colors.white} />}</Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Conversar com TatinhIA" accessibilityState={{ disabled: !intent.trim() || submitting || voiceBusy || recorderState.isRecording, busy: submitting }} disabled={!intent.trim() || submitting || voiceBusy || recorderState.isRecording} onPress={() => submit(intent)} style={[styles.send, (!intent.trim() || submitting || voiceBusy || recorderState.isRecording) && styles.sendDisabled]}>{submitting ? <ActivityIndicator color={theme.colors.ink} /> : <Ionicons name="arrow-forward" size={22} color={theme.colors.ink} />}</Pressable>
      </View></View>
    </View>
    <Text style={styles.privacyHint}>{recorderState.isRecording ? `Gravando ${Math.round(recorderState.durationMillis / 1000)}s de 20s · toque para enviar` : voiceBusy ? 'Transcrevendo sua mensagem…' : 'Descreva apenas serviço, região e horário. O áudio é enviado à xAI para transcrição; não inclua nomes ou detalhes clínicos.'}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Conhecer a TatinhIA" onPress={() => router.push('/education/tatinhia')} style={styles.educationAction}><Text style={styles.educationActionText}>Como a TatinhIA ajuda</Text><Ionicons name="arrow-forward" size={15} color={theme.colors.ink} /></Pressable>
    {!!message && <Text accessibilityRole="alert" style={styles.message}>{message}</Text>}
    {!!conciergeReply && <View style={styles.answer} accessibilityLiveRegion="polite"><View style={styles.answerHead}><View style={styles.assistantIcon}><Ionicons name="sparkles" size={15} color={theme.colors.ink} /></View><Text style={styles.assistantName}>TatinhIA</Text></View><Text style={styles.answerText}>{conciergeReply}</Text><View style={styles.answerActions}><Pressable accessibilityRole="button" accessibilityLabel="Ouvir resposta da TatinhIA" onPress={() => { Speech.stop(); Speech.speak(conciergeReply, { language: 'pt-BR', rate: 0.92 }); }} style={styles.listen}><Ionicons name="volume-medium-outline" size={17} color={theme.colors.ink} /><Text style={styles.listenText}>Ouvir resposta</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Ver profissionais sugeridos" onPress={() => router.push('/(patient)/results')} style={styles.seeResults}><Text style={styles.seeResultsText}>Ver profissionais</Text><Ionicons name="arrow-forward" size={16} color={theme.colors.white} /></Pressable></View></View>}
    <View style={[styles.suggestionRow, narrow && styles.suggestionRowNarrow]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fisioterapia" accessibilityState={{ disabled: submitting }} disabled={submitting} onPress={() => submit('Fisioterapia')} style={[styles.suggestion, narrow && styles.suggestionNarrow]}><Ionicons name="body-outline" size={18} color={theme.colors.ink} /><Text style={styles.suggestionText}>Fisioterapia</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.ink} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Pós-operatório" accessibilityState={{ disabled: submitting }} disabled={submitting} onPress={() => submit('Pós-operatório')} style={[styles.suggestion, narrow && styles.suggestionNarrow]}><Ionicons name="medkit-outline" size={18} color={theme.colors.ink} /><Text style={styles.suggestionText}>Pós-operatório</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.ink} /></Pressable>
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
    <View style={styles.section}><View style={[styles.sectionHead, largeText && styles.sectionHeadLarge]}><SectionTitle title="Conheça quem cuida" caption="Perfis para você comparar" /><Pressable accessibilityRole="button" accessibilityLabel="Ver todos os profissionais" onPress={() => { chooseService('demo-service-physio'); router.push('/(patient)/results'); }} style={styles.textAction}><Text style={styles.textActionLabel}>Ver perfis</Text><Ionicons name="arrow-forward" size={16} color={theme.colors.ink} /></Pressable></View>
      <View style={[styles.featuredRow, narrow && styles.featuredRowNarrow]}>{featured.map(professional => <Pressable key={professional.id} accessibilityRole="button" accessibilityLabel={`Abrir perfil de ${professional.displayName}`} onPress={() => { chooseService('demo-service-physio'); router.push(`/(patient)/profile/${professional.id}`); }} style={[styles.featuredCard, narrow && styles.featuredCardNarrow]}><Avatar name={professional.displayName} source={portraitFor(professional.id)} size={76} /><Text style={styles.featuredName}>{professional.displayName}</Text><Text style={styles.featuredRole}>Fisioterapia em casa</Text><View style={styles.featuredFoot}><Text style={styles.featuredPrice}>{money(professional.hourlyPriceCents)} / hora</Text><Ionicons name="arrow-forward" size={16} color={theme.colors.ink} /></View></Pressable>)}</View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Abrir área da família" onPress={() => router.push('/(family)/schedule')} style={styles.family}>
      <View style={styles.familyAvatars}><Avatar name={user?.displayName ?? 'Você'} size={34} /><View style={styles.familyOverlap}><Avatar name="Rafa" size={34} tone="blue" /></View></View>
      <Text style={styles.familyText}>Organize o cuidado da família</Text><Ionicons name="arrow-forward" size={19} color={theme.colors.ink} />
    </Pressable>
    <Text style={styles.demoNote}>Atendimento em {location.neighborhood}, São Paulo</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, account: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
  assistantHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: -9 }, assistantIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }, assistantName: { fontSize: 14, fontWeight: '800', color: theme.colors.ink }, assistantCaption: { fontSize: 11, color: theme.colors.muted }, educationAction: { alignSelf: 'flex-start', minHeight: 32, marginTop: -12, flexDirection: 'row', alignItems: 'center', gap: 5 }, educationActionText: { color: theme.colors.ink, fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' }, answer: { borderWidth: 1, borderColor: theme.colors.line, borderRadius: 16, backgroundColor: theme.colors.surface, padding: 15, gap: 12 }, answerHead: { flexDirection: 'row', alignItems: 'center', gap: 9 }, answerText: { fontSize: 15, lineHeight: 22, color: theme.colors.ink }, answerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, listen: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10 }, listenText: { fontSize: 12, fontWeight: '700', color: theme.colors.ink }, seeResults: { minHeight: 44, borderRadius: 10, backgroundColor: theme.colors.ink, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 }, seeResultsText: { fontSize: 12, fontWeight: '700', color: theme.colors.white },
  hairline: { height: 1, backgroundColor: theme.colors.line }, intro: { gap: 8 }, greeting: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 }, title: { color: theme.colors.ink, fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.8 },
  composer: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, overflow: 'hidden' }, input: { minHeight: 78, paddingHorizontal: 17, paddingTop: 16, paddingBottom: 10, color: theme.colors.ink, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' }, composerDivider: { height: 1, backgroundColor: theme.colors.line, marginHorizontal: 12 }, composerBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 9 }, composerHintRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, composerHint: { color: theme.colors.muted, fontSize: 13 }, composerHintLarge: { fontSize: 11 }, composerActions: { flexDirection: 'row', gap: 8 }, mic: { width: 44, height: 44, borderRadius: 11, backgroundColor: theme.colors.ink, alignItems: 'center', justifyContent: 'center' }, micActive: { backgroundColor: theme.colors.error }, send: { width: 44, height: 44, borderRadius: 11, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: 0.45 }, message: { color: theme.colors.error, fontSize: 13, lineHeight: 19 }, privacyHint: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: -10 },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, suggestionRowNarrow: { flexDirection: 'column' }, suggestion: { flexGrow: 1, minWidth: 145, minHeight: 48, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: 11, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11 }, suggestionNarrow: { flexGrow: 0, alignSelf: 'stretch', width: '100%', minWidth: 0, minHeight: 56 }, suggestionText: { flex: 1, color: theme.colors.ink, fontSize: 14, fontWeight: '600' },
  section: { gap: 12 }, sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionHeadLarge: { flexDirection: 'column', alignItems: 'flex-start' }, textAction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 }, textActionLabel: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' }, services: { flexDirection: 'row', gap: 9 }, servicesNarrow: { flexDirection: 'column' }, service: { flex: 1, minWidth: 0, minHeight: 106, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8 }, serviceNarrow: { flex: 0, minHeight: 64, flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 12 }, serviceIcon: { width: 39, height: 39, borderRadius: 11, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, serviceName: { color: theme.colors.ink, textAlign: 'center', fontSize: 12, lineHeight: 16, fontWeight: '700' }, serviceNameNarrow: { flex: 1, textAlign: 'left', fontSize: 13 },
  visit: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, padding: 16, gap: 14 }, visitTop: { flexDirection: 'row', gap: 12, alignItems: 'center' }, dateBlock: { width: 51, height: 55, backgroundColor: theme.colors.accent, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, dateDay: { color: theme.colors.ink, fontSize: 22, fontWeight: '700', lineHeight: 24 }, dateMonth: { color: theme.colors.ink, fontSize: 11, fontWeight: '700' }, visitInfo: { flex: 1, gap: 4 }, visitTime: { color: theme.colors.ink, fontSize: 14, fontWeight: '700' }, visitService: { color: theme.colors.muted, fontSize: 13, lineHeight: 18 }, visitBottom: { flexDirection: 'row', alignItems: 'center', gap: 9 }, visitName: { color: theme.colors.ink, fontSize: 14, fontWeight: '700' }, visitStatus: { color: theme.colors.success, fontSize: 12 },
  featuredRow: { flexDirection: 'row', gap: 10 }, featuredRowNarrow: { flexDirection: 'column' }, featuredCard: { flex: 1, minWidth: 0, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 15, padding: 13, gap: 6 }, featuredCardNarrow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }, featuredName: { color: theme.colors.ink, fontSize: 14, fontWeight: '800', marginTop: 4 }, featuredRole: { color: theme.colors.muted, fontSize: 11 }, featuredFoot: { marginTop: 4, borderTopWidth: 1, borderColor: theme.colors.line, paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, featuredPrice: { color: theme.colors.ink, fontSize: 12, fontWeight: '800' },
  family: { minHeight: 68, borderWidth: 1, borderRadius: 14, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, familyAvatars: { flexDirection: 'row', width: 57 }, familyOverlap: { marginLeft: -11 }, familyText: { color: theme.colors.ink, fontSize: 14, fontWeight: '600', flex: 1 }, demoNote: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' }
});
