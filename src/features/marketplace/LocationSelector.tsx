import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { demoLocationForRegion, demoLocations } from '../demo/locations';
import { theme } from '../../theme/tokens';

export function LocationSelector({ regionCode, onSelect, initiallyExpanded = false }: { regionCode: string; onSelect: (code: string) => void; initiallyExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const selected = demoLocationForRegion(regionCode);
  return <View style={styles.wrapper}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Localização: ${selected.neighborhood}, ${selected.city}`}
      accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={styles.trigger}>
      <Ionicons name="location-outline" size={19} color={theme.colors.ink} />
      <Text style={styles.location}>{selected.neighborhood}, {selected.city}</Text>
      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={theme.colors.muted} />
    </Pressable>
    {expanded && <View style={styles.options}>
      <Text style={styles.caption}>Locais fictícios da demonstração</Text>
      {demoLocations.map(location => <Pressable key={location.regionCode} accessibilityRole="button"
        accessibilityLabel={`Escolher ${location.neighborhood}`} accessibilityState={{ selected: location.regionCode === regionCode }}
        onPress={() => { onSelect(location.regionCode); setExpanded(false); }} style={styles.option}>
        <View style={styles.optionText}><Text style={styles.optionTitle}>{location.label}</Text><Text style={styles.caption}>{location.city}</Text></View>
        {location.regionCode === regionCode && <Ionicons name="checkmark" size={19} color={theme.colors.success} />}
      </Pressable>)}
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 }, trigger: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 12, backgroundColor: theme.colors.surfaceMuted, paddingHorizontal: 13 },
  location: { flex: 1, color: theme.colors.ink, fontSize: 14, fontWeight: '600' },
  options: { borderRadius: 14, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, padding: 12, gap: 4 },
  caption: { color: theme.colors.muted, fontSize: 12, lineHeight: 17 },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingVertical: 6, borderTopWidth: 1, borderColor: theme.colors.line },
  optionText: { flex: 1, gap: 2 }, optionTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '600' }
});
