import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, DemoPill } from '../src/components/ui/Primitives';
import { useDemo } from '../src/features/demo/DemoContext';
import { theme } from '../src/theme/tokens';

function PathCard({ icon, title, description, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; description: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={styles.pathCard}>
    <View style={styles.pathIcon}><Ionicons name={icon} size={22} color={theme.colors.ink} /></View>
    <View style={styles.pathContent}><Text style={styles.pathTitle}>{title}</Text><Text style={styles.pathDescription}>{description}</Text></View>
    <Ionicons name="arrow-forward" size={19} color={theme.colors.ink} />
  </Pressable>;
}

export default function Home() {
  const { setActiveUserId } = useDemo();
  const enter = (id: string, route: '/(patient)/home' | '/(family)/schedule') => { setActiveUserId(id); router.push(route); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.topbar}><Brand /><DemoPill /></View>
    <View style={styles.intro}><Text style={styles.kicker}>HOMECARE GRID · DEMONSTRAÇÃO</Text><Text accessibilityRole="header" style={styles.title}>Cuidado em casa, com clareza.</Text><Text style={styles.description}>Encontre profissionais, organize horários e acompanhe a família em uma jornada simples.</Text></View>
    <View style={styles.rule} />
    <View style={styles.paths}><Text accessibilityRole="header" style={styles.sectionTitle}>Como você quer começar?</Text><Text style={styles.sectionDescription}>Escolha um papel para explorar os fluxos com dados fictícios.</Text>
      <PathCard icon="search-outline" title="Preciso de cuidado" description="Busque profissionais e envie uma solicitação." onPress={() => enter('demo-contractor', '/(patient)/home')} />
      <PathCard icon="calendar-outline" title="Sou profissional" description="Veja e responda às solicitações recebidas." onPress={() => router.push('/(auth)/sign-in')} />
      <PathCard icon="people-outline" title="Cuido junto com a família" description="Acompanhe a agenda conforme suas permissões." onPress={() => enter('demo-family', '/(family)/schedule')} />
    </View>
    <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/sign-in')} style={styles.accessLink}><Ionicons name="information-circle-outline" size={19} color={theme.colors.ink} /><Text style={styles.accessText}>Entenda o acesso na demonstração</Text><Ionicons name="chevron-forward" size={17} color={theme.colors.ink} /></Pressable>
    <Text style={styles.footer}>Experiência demonstrativa · sem dados pessoais ou pagamentos reais</Text>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background }, content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32, gap: 28 }, topbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  intro: { paddingTop: 20, gap: 12 }, kicker: { color: theme.colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }, title: { color: theme.colors.ink, fontSize: 30, lineHeight: 37, fontWeight: '700', letterSpacing: -0.8, maxWidth: 400 }, description: { color: theme.colors.muted, fontSize: 16, lineHeight: 24, maxWidth: 460 }, rule: { height: 3, width: 42, borderRadius: 3, backgroundColor: theme.colors.accent },
  paths: { gap: 11 }, sectionTitle: { color: theme.colors.ink, fontSize: 19, lineHeight: 25, fontWeight: '700' }, sectionDescription: { color: theme.colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 5 }, pathCard: { minHeight: 92, borderRadius: 15, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }, pathIcon: { width: 43, height: 43, borderRadius: 11, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }, pathContent: { flex: 1, gap: 4 }, pathTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '700' }, pathDescription: { color: theme.colors.muted, fontSize: 12, lineHeight: 17 }, accessLink: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }, accessText: { flex: 1, color: theme.colors.ink, fontSize: 13, fontWeight: '700' }, footer: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center' }
});
