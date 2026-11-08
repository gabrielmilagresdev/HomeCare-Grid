import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Avatar, Brand, Screen, StateMessage } from '../../src/components/ui/Primitives';
import { useDemo } from '../../src/features/demo/DemoContext';
import { portraitFor } from '../../src/features/demo/portraits';
import { educationTopics, type EducationTopic } from '../../src/features/education/content';
import { theme } from '../../src/theme/tokens';

function HeroArt({ topic }: { topic: EducationTopic }) {
  if (topic === 'profissionais') return <View style={styles.artRow}>
    <View style={styles.artPortrait}><Avatar name="Nina Ribeiro" source={portraitFor('demo-professional-d')} size={64} /></View>
    <View style={styles.artPortrait}><Avatar name="Caio Martins" source={portraitFor('demo-professional-b')} size={64} /></View>
    <View style={styles.artTag}><Ionicons name="heart-outline" size={16} color={theme.colors.ink} /><Text style={styles.artTagText}>Cuidado em casa</Text></View>
  </View>;
  if (topic === 'familia') return <View style={styles.artRow}>
    <View style={styles.artPortrait}><Avatar name="Lucas" size={64} tone="peach" /></View>
    <View style={styles.artPortrait}><Avatar name="Rafa" size={64} tone="blue" /></View>
    <View style={styles.artTag}><Ionicons name="calendar-outline" size={16} color={theme.colors.ink} /><Text style={styles.artTagText}>Agenda compartilhada</Text></View>
  </View>;
  return <View style={styles.artRow}><View style={styles.aiBubble}><Ionicons name="chatbubble-ellipses-outline" size={30} color={theme.colors.ink} /><View style={styles.aiSpark}><Ionicons name="sparkles" size={15} color={theme.colors.ink} /></View></View><View style={styles.artTag}><Ionicons name="mic-outline" size={17} color={theme.colors.ink} /><Text style={styles.artTagText}>Texto ou voz</Text></View></View>;
}

export default function EducationDetail() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const { setActiveUserId, chooseService } = useDemo();
  const key = typeof topic === 'string' && topic in educationTopics ? topic as EducationTopic : null;
  if (!key) return <Screen back title="Conteúdo indisponível"><StateMessage title="Página não encontrada" message="Escolha uma das histórias do Tato para continuar." action="Ver histórias" onAction={() => router.replace('/education')} /></Screen>;
  const item = educationTopics[key];
  const openFeature = () => {
    setActiveUserId('demo-contractor');
    if (key === 'profissionais') { chooseService('demo-service-physio'); router.push('/(patient)/results'); }
    else if (key === 'familia') router.push('/(family)/schedule');
    else router.push('/(patient)/home');
  };
  return <Screen header={false} footer={false} compact bottom={<View style={styles.bottom}><Button label={item.action} onPress={openFeature} icon={<Ionicons name="arrow-forward" size={19} color={theme.colors.white} />} /></View>}>
    <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Voltar à apresentação" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={theme.colors.ink} /></Pressable><Brand /><Text style={styles.counter}>{item.number} / 03</Text></View>
    <View style={[styles.hero, key === 'tatinhia' && styles.heroDark, key === 'profissionais' && styles.heroAccent]}>
      <View style={styles.heroTop}><View style={[styles.heroIcon, key === 'tatinhia' && styles.heroIconLight]}><Ionicons name={item.icon} size={19} color={theme.colors.ink} /></View><Text style={[styles.eyebrow, key === 'tatinhia' && styles.heroLightText]}>{item.label}</Text></View>
      <Text accessibilityRole="header" style={[styles.title, key === 'tatinhia' && styles.heroLightText]}>{item.title}</Text>
      <Text style={[styles.description, key === 'tatinhia' && styles.heroLightDescription]}>{item.description}</Text>
      <HeroArt topic={key} />
    </View>
    <View style={styles.stepsSection}><Text style={styles.sectionEyebrow}>COMO FUNCIONA</Text><Text accessibilityRole="header" style={styles.sectionTitle}>Em três passos simples</Text>
      <View style={styles.steps}>{item.steps.map((step, index) => <View key={step.title} style={styles.step}><View style={styles.stepIcon}><Ionicons name={step.icon} size={21} color={theme.colors.ink} /></View><View style={styles.stepText}><Text style={styles.stepNumber}>0{index + 1}</Text><Text style={styles.stepTitle}>{step.title}</Text><Text style={styles.stepBody}>{step.body}</Text></View></View>)}</View>
    </View>
    <View style={styles.note}><Ionicons name="information-circle-outline" size={20} color={theme.colors.ink} /><Text style={styles.noteText}>{item.note}</Text></View>
    {key === 'profissionais' && <Pressable accessibilityRole="button" accessibilityLabel="Sou profissional: escolher perfil" onPress={() => router.push('/(auth)/sign-in')} style={styles.next}><Text style={styles.nextName}>Sou profissional</Text><Ionicons name="arrow-forward" size={19} color={theme.colors.ink} /></Pressable>}
    {item.next && <Pressable accessibilityRole="button" accessibilityLabel={`Próxima história: ${educationTopics[item.next].label}`} onPress={() => router.push(`/education/${item.next}`)} style={styles.next}><Text style={styles.nextLabel}>Próxima história</Text><Text style={styles.nextName}>{educationTopics[item.next].label}</Text><Ionicons name="arrow-forward" size={19} color={theme.colors.ink} /></Pressable>}
  </Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }, back: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, counter: { marginLeft: 'auto', color: theme.colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  hero: { borderRadius: 22, backgroundColor: theme.colors.surfaceMuted, padding: 21, gap: 12 }, heroDark: { backgroundColor: theme.colors.ink }, heroAccent: { backgroundColor: theme.colors.accent }, heroTop: { flexDirection: 'row', alignItems: 'center', gap: 9 }, heroIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, heroIconLight: { backgroundColor: theme.colors.accent }, eyebrow: { color: theme.colors.ink, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }, heroLightText: { color: theme.colors.white }, title: { color: theme.colors.ink, fontSize: 31, lineHeight: 36, fontWeight: '800', letterSpacing: -0.9 }, description: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 }, heroLightDescription: { color: '#E8E3E9' },
  artRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 6, flexWrap: 'wrap' }, artPortrait: { borderRadius: 22, padding: 3, backgroundColor: theme.colors.white }, artTag: { minHeight: 35, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.white, borderRadius: 10, paddingHorizontal: 10 }, artTagText: { color: theme.colors.ink, fontSize: 11, fontWeight: '800' }, aiBubble: { width: 67, height: 67, borderRadius: 21, backgroundColor: theme.colors.white, alignItems: 'center', justifyContent: 'center' }, aiSpark: { position: 'absolute', right: -6, top: -6, width: 27, height: 27, borderRadius: 9, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  stepsSection: { gap: 10, paddingTop: 10 }, sectionEyebrow: { color: theme.colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }, sectionTitle: { color: theme.colors.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 }, steps: { gap: 9 }, step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 15, padding: 12 }, stepIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, stepText: { flex: 1, gap: 2 }, stepNumber: { color: theme.colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }, stepTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '800' }, stepBody: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  note: { flexDirection: 'row', gap: 9, backgroundColor: theme.colors.accent, borderRadius: 14, padding: 13 }, noteText: { color: theme.colors.ink, fontSize: 12, lineHeight: 18, flex: 1 }, next: { minHeight: 55, borderTopWidth: 1, borderColor: theme.colors.line, flexDirection: 'row', alignItems: 'center', gap: 8 }, nextLabel: { color: theme.colors.muted, fontSize: 12 }, nextName: { color: theme.colors.ink, fontSize: 12, fontWeight: '800', flex: 1 }, bottom: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8, borderTopWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.background }
});
