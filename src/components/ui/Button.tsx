import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme/tokens';
export function Button({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, (pressed || disabled) && styles.dim]}><Text style={styles.label}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: theme.minTouchTarget, justifyContent: 'center', padding: 16, borderRadius: theme.radius, backgroundColor: theme.colors.mint, borderWidth: 1, borderColor: theme.colors.primary },
  label: { color: theme.colors.ink, fontSize: 17, fontWeight: '600', textAlign: 'center' }, dim: { opacity: 0.65 }
});
