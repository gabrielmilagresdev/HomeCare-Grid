import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/tokens';
export function Button({ label, onPress, disabled = false, loading = false, variant = 'primary', icon, compact = false }: {
  label: string; onPress: () => void; disabled?: boolean; loading?: boolean; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; icon?: ReactNode; compact?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || loading, busy: loading }}
    disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, styles[variant], compact && styles.compact, (pressed || disabled) && styles.dim]}>
    <View style={styles.inner}>{loading ? <ActivityIndicator color={variant === 'primary' ? theme.colors.white : theme.colors.primary} /> : icon}
      <Text style={[styles.label, variant === 'primary' ? styles.lightLabel : variant === 'danger' ? styles.dangerLabel : styles.darkLabel]}>{label}</Text></View>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: theme.minTouchTarget, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  primary: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.mint, borderColor: theme.colors.mint },
  ghost: { backgroundColor: theme.colors.white, borderColor: theme.colors.line },
  danger: { backgroundColor: theme.colors.errorSoft, borderColor: theme.colors.errorSoft },
  compact: { paddingHorizontal: 14, paddingVertical: 10 },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  label: { fontSize: 15, fontWeight: '700', textAlign: 'center' }, lightLabel: { color: theme.colors.white }, darkLabel: { color: theme.colors.ink }, dangerLabel: { color: theme.colors.error },
  dim: { opacity: 0.65 }
});
