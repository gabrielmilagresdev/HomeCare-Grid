import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/tokens';

export interface BookingTimelineEntry { id: string; label: string; detail: string }

export function BookingTimeline({ entries }: { entries: BookingTimelineEntry[] }) {
  return <View style={styles.container}>
    <Text style={styles.title}>Histórico administrativo</Text>
    <View style={styles.entry}><View style={styles.dot} /><View style={styles.copy}><Text style={styles.label}>Solicitação criada</Text><Text style={styles.detail}>Registro local, sem envio ao profissional.</Text></View></View>
    {entries.map(entry => <View key={entry.id} style={styles.entry}><View style={styles.dot} /><View style={styles.copy}><Text style={styles.label}>{entry.label}</Text><Text style={styles.detail}>{entry.detail}</Text></View></View>)}
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: 10, padding: 14, borderRadius: 14, backgroundColor: theme.colors.background },
  title: { color: theme.colors.ink, fontSize: 13, fontWeight: '800' },
  entry: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 5, backgroundColor: theme.colors.primary },
  copy: { flex: 1, gap: 2 },
  label: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' },
  detail: { color: theme.colors.muted, fontSize: 11, lineHeight: 16 }
});
