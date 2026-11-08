import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { theme } from '../../theme/tokens';

type Destination = 'home' | 'agenda' | 'family' | 'account';
const destinations = [
  { id: 'home', label: 'Início', icon: 'home-outline', href: '/(patient)/home' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar-outline', href: '/(patient)/bookings' },
  { id: 'family', label: 'Família', icon: 'people-outline', href: '/(family)/schedule' },
  { id: 'account', label: 'Conta', icon: 'person-outline', href: '/(auth)/sign-in' }
] as const;

export function BottomNavigation({ active }: { active: Destination }) {
  const largeText = useWindowDimensions().fontScale >= 1.4;
  return <View accessibilityRole="tablist" style={[styles.bar, largeText && styles.barLarge]}>{destinations.map(item => {
    const selected = item.id === active;
    return <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected }}
      onPress={() => router.push(item.href)} style={[styles.item, largeText && styles.itemLarge]}>
      <View style={[styles.indicator, selected && styles.activeIndicator]} />
      <Ionicons name={item.icon} size={22} color={selected ? theme.colors.ink : theme.colors.muted} />
      <Text numberOfLines={1} style={[styles.label, largeText && styles.labelLarge, selected && styles.activeLabel]}>{item.label}</Text>
    </Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', minHeight: 67, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.line, paddingHorizontal: 8 },
  barLarge: { minHeight: 82 }, item: { flex: 1, minWidth: 0, minHeight: 62, alignItems: 'center', justifyContent: 'center', gap: 4 }, itemLarge: { minHeight: 78 },
  indicator: { height: 3, width: 26, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 1 },
  activeIndicator: { backgroundColor: theme.colors.accent },
  label: { color: theme.colors.muted, fontSize: 12, lineHeight: 16, fontWeight: '600' }, labelLarge: { fontSize: 10, lineHeight: 14 },
  activeLabel: { color: theme.colors.ink, fontWeight: '700' }
});
