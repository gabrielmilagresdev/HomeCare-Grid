import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../ui/Button';
import { theme } from '../../theme/tokens';
export function FoundationScreen({ title, description }: { title: string; description: string }) {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text accessibilityRole="header" style={styles.brand}>HomeCare Grid</Text>
    <Text style={styles.slogan}>O cuidado certo, onde você está.</Text>
    <View style={styles.card}><Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text style={styles.body}>{description}</Text><Text style={styles.notice}>Esta área está em preparação.</Text></View>
    <Button label="Voltar ao início" onPress={() => router.replace('/')} />
  </ScrollView></SafeAreaView>;
}
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: 24, gap: 20, maxWidth: 640, width: '100%', alignSelf: 'center' },
  brand: { fontSize: 30, fontWeight: '700', color: theme.colors.ink }, slogan: { fontSize: 18, color: theme.colors.ink },
  card: { padding: 24, borderRadius: 16, backgroundColor: theme.colors.mint, gap: 16 },
  title: { fontSize: 24, fontWeight: '600', color: theme.colors.ink }, body: { fontSize: 18, lineHeight: 27, color: theme.colors.ink }, notice: { fontSize: 16, lineHeight: 24, color: theme.colors.ink }
});
