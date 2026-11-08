import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, DemoPill, Eyebrow, SectionTitle } from '../src/components/ui/Primitives';
import { useDemo } from '../src/features/demo/DemoContext';
import { theme } from '../src/theme/tokens';

function PathCard({ icon, title, description, onPress, color }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; description: string; onPress: () => void; color: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.pathCard, pressed && { opacity: 0.7 }]}>
    <View style={[styles.pathIcon, { backgroundColor: color }]}><Ionicons name={icon} size={22} color={theme.colors.deep} /></View>
    <View style={styles.pathContent}><Text style={styles.pathTitle}>{title}</Text><Text style={styles.pathDescription}>{description}</Text></View>
    <Ionicons name="arrow-forward" size={19} color={theme.colors.primary} />
  </Pressable>;
}

export default function Home() {
  const { setActiveUserId } = useDemo();
  const enter = (id: string, route: '/(patient)/home' | '/(family)/schedule') => { setActiveUserId(id); router.push(route); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.topbar}><Brand /><DemoPill /></View>
    <LinearGradient colors={[theme.colors.deep, '#11685F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.decorCircle} /><View style={styles.decorCircleSmall} />
      <View style={styles.heroTop}><View style={styles.heroKicker}><Ionicons name="sparkles" size={15} color={theme.colors.mintStrong} /><Text style={styles.heroKickerText}>CUIDADO QUE SE CONECTA</Text></View></View>
      <Text accessibilityRole="header" style={styles.heroTitle}>O cuidado certo, <Text style={{ color: theme.colors.mintStrong }}>onde você está.</Text></Text>
      <Text style={styles.heroDescription}>Encontre apoio domiciliar com clareza, autonomia e uma rede que cuida junto.</Text>
      <View style={styles.heroBottom}><View style={styles.heroAvatar}><Ionicons name="heart" size={21} color={theme.colors.deep} /></View><Text style={styles.heroFootnote}>Feito para pessoas e famílias reais. Aqui, os dados são fictícios.</Text></View>
    </LinearGradient>
    <View style={styles.intro}><Eyebrow>COMECE POR AQUI</Eyebrow><SectionTitle title="Como podemos ajudar?" caption="Escolha um papel para explorar a jornada demonstrativa." /></View>
    <View style={styles.paths}>
      <PathCard icon="search-outline" title="Preciso de cuidado" description="Explore profissionais e solicite atendimento." color={theme.colors.mint} onPress={() => enter('demo-contractor', '/(patient)/home')} />
      <PathCard icon="calendar-outline" title="Sou profissional" description="Escolha seu perfil e responda solicitações." color={theme.colors.peach} onPress={() => router.push('/(auth)/sign-in')} />
      <PathCard icon="people-outline" title="Cuido junto com a família" description="Veja a agenda com permissões explícitas." color={theme.colors.blue} onPress={() => enter('demo-family', '/(family)/schedule')} />
    </View>
    <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/sign-in')} style={styles.accessLink}><Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.primary} /><Text style={styles.accessText}>Entenda o acesso na demonstração</Text><Ionicons name="chevron-forward" size={16} color={theme.colors.primary} /></Pressable>
    <Text style={styles.footer}>HomeCare Grid · MVP para Hackathon USP</Text>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background }, content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 30, gap: 22 },
  topbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hero: { minHeight: 316, borderRadius: 28, padding: 28, overflow: 'hidden', justifyContent: 'space-between', gap: 20 }, decorCircle: { position: 'absolute', width: 230, height: 230, borderRadius: 120, right: -55, top: 60, backgroundColor: 'rgba(255,255,255,0.06)' }, decorCircleSmall: { position: 'absolute', width: 110, height: 110, borderRadius: 60, right: 40, top: 115, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  heroTop: { alignItems: 'flex-start' }, heroKicker: { flexDirection: 'row', alignItems: 'center', gap: 7 }, heroKickerText: { color: theme.colors.mintStrong, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 }, heroTitle: { color: theme.colors.white, fontSize: 39, lineHeight: 43, fontWeight: '800', letterSpacing: -1.6, maxWidth: 340 }, heroDescription: { color: '#D4E8E3', fontSize: 15, lineHeight: 23, maxWidth: 310 }, heroBottom: { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: 310 }, heroAvatar: { width: 35, height: 35, borderRadius: 12, backgroundColor: theme.colors.mintStrong, alignItems: 'center', justifyContent: 'center' }, heroFootnote: { color: '#D4E8E3', fontSize: 11, lineHeight: 16, flex: 1 },
  intro: { gap: 9, paddingTop: 5 }, paths: { gap: 11 }, pathCard: { minHeight: 96, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.white, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 13 }, pathIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, pathContent: { flex: 1, gap: 4 }, pathTitle: { fontWeight: '800', fontSize: 15, color: theme.colors.ink }, pathDescription: { fontSize: 12, lineHeight: 17, color: theme.colors.muted }, accessLink: { minHeight: 48, flexDirection: 'row', gap: 9, alignItems: 'center', paddingHorizontal: 5 }, accessText: { flex: 1, color: theme.colors.primary, fontSize: 13, fontWeight: '700' }, footer: { color: theme.colors.muted, fontSize: 11, textAlign: 'center' }
});
