import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Screen } from '../../src/components/ui/Primitives';
import { educationTopics, type EducationTopic } from '../../src/features/education/content';
import { theme } from '../../src/theme/tokens';

const order: EducationTopic[] = ['tatinhia', 'profissionais', 'familia'];

export default function EducationIndex() {
  return <Screen header={false} footer={false} compact>
    <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={theme.colors.ink} /></Pressable><Brand /></View>
    <View style={styles.intro}><Text style={styles.eyebrow}>CONHEÇA O TATO</Text><Text accessibilityRole="header" style={styles.title}>Um jeito mais próximo de cuidar.</Text><Text style={styles.description}>Explore as três partes da jornada e escolha por onde começar.</Text></View>
    <View style={styles.list}>{order.map(topic => {
      const item = educationTopics[topic];
      return <Pressable key={topic} accessibilityRole="button" accessibilityLabel={`Conhecer ${item.label}`} onPress={() => router.push(`/education/${topic}`)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.cardTop}><View style={[styles.icon, topic === 'tatinhia' && styles.iconAccent]}><Ionicons name={item.icon} size={24} color={theme.colors.ink} /></View><Text style={styles.number}>{item.number} / 03</Text></View>
        <Text style={styles.cardTitle}>{topic === 'familia' ? 'Family Hub' : topic === 'profissionais' ? 'Profissionais' : 'TatinhIA'}</Text>
        <Text style={styles.cardBody}>{item.description}</Text>
        <View style={styles.cardFoot}><Text style={styles.open}>Conhecer</Text><Ionicons name="arrow-forward" size={18} color={theme.colors.ink} /></View>
      </Pressable>;
    })}</View>
    <Text style={styles.footnote}>Cuidado começa com informação clara.</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }, back: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
  intro: { paddingVertical: 22, gap: 10 }, eyebrow: { color: theme.colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.3 }, title: { color: theme.colors.ink, fontSize: 33, lineHeight: 38, fontWeight: '800', letterSpacing: -1.1 }, description: { color: theme.colors.muted, fontSize: 15, lineHeight: 23 },
  list: { gap: 12 }, card: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 19, padding: 17, gap: 10 }, pressed: { opacity: 0.7 }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, icon: { width: 47, height: 47, borderRadius: 14, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, iconAccent: { backgroundColor: theme.colors.accent }, number: { color: theme.colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }, cardTitle: { color: theme.colors.ink, fontSize: 19, fontWeight: '800', letterSpacing: -0.4 }, cardBody: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 }, cardFoot: { borderTopWidth: 1, borderColor: theme.colors.line, paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, open: { color: theme.colors.ink, fontSize: 13, fontWeight: '800' }, footnote: { color: theme.colors.muted, fontSize: 12, textAlign: 'center', paddingVertical: 15 }
});
