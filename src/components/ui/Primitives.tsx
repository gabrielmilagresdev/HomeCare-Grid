import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme } from '../../theme/tokens';
import { Button } from './Button';

export function Brand({ light = false }: { light?: boolean }) {
  const stroke = light ? theme.colors.white : theme.colors.ink;
  return <View style={styles.brandRow} accessibilityLabel="Tato"><Svg width={32} height={32} viewBox="0 0 64 64" accessibilityRole="image" accessibilityLabel="Marca Tato, duas formas em contato">
    <Path d="M26 10C16 10 9 18 9 28v7c0 10 7 18 17 18h4" fill="none" stroke={stroke} strokeWidth={7} strokeLinecap="round" />
    <Path d="M38 54c10 0 17-8 17-18v-7c0-10-7-18-17-18h-4" fill="none" stroke={stroke} strokeWidth={7} strokeLinecap="round" />
    <Circle cx={32} cy={32} r={7} fill={theme.colors.accent} />
  </Svg><Text style={[styles.brandText, light && { color: theme.colors.white }]}>tato</Text></View>;
}

export function Screen({ children, back, title, subtitle, right, bottom, header = true, footer = true, compact = false }: { children: ReactNode; back?: boolean; title?: string; subtitle?: string; right?: ReactNode; bottom?: ReactNode; header?: boolean; footer?: boolean; compact?: boolean }) {
  return <SafeAreaView style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" style={styles.scroll} contentContainerStyle={[styles.content, compact && styles.contentCompact]}>
    {header && <View style={styles.topbar}><View style={styles.topLeft}>{back && <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.back}><Ionicons name="arrow-back" size={21} color={theme.colors.ink} /></Pressable>}<Pressable accessibilityRole="button" accessibilityLabel="Ir ao início" onPress={() => router.replace('/')}><Brand /></Pressable></View>{right}</View>}
    {title && <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>}
    {children}
    {footer && <Text style={styles.footer}>Tato · Cuidado que conecta</Text>}
  </ScrollView>{bottom}</SafeAreaView>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) { return <View style={[styles.card, style]}>{children}</View>; }
export function Eyebrow({ children }: { children: ReactNode }) { return <Text style={styles.eyebrow}>{children}</Text>; }
export function SectionTitle({ title, caption }: { title: string; caption?: string }) { return <View style={styles.sectionTitle}><Text accessibilityRole="header" style={styles.sectionText}>{title}</Text>{caption && <Text style={styles.sectionCaption}>{caption}</Text>}</View>; }
export function Badge({ label, tone = 'mint' }: { label: string; tone?: 'mint' | 'peach' | 'neutral' | 'error' }) { return <View style={[styles.badge, styles[`badge_${tone}`]]}><Text style={styles.badgeText}>{label}</Text></View>; }
export function Avatar({ name, tone = 'mint', size = 54, source }: { name: string; tone?: 'mint' | 'peach' | 'blue'; size?: number; source?: ImageSourcePropType | undefined }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return <View accessibilityLabel={source ? `Foto de ${name}` : name} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: tone === 'peach' ? theme.colors.peach : tone === 'blue' ? theme.colors.blue : theme.colors.mint }]}>{source ? <Image source={source} style={{ width: size, height: size }} resizeMode="cover" /> : <Text style={[styles.avatarText, { fontSize: size * 0.31 }]}>{initials}</Text>}</View>;
}
export function Field({ label, value, onChangeText, placeholder, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; multiline?: boolean }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.colors.textMuted} multiline={multiline} style={[styles.input, multiline && { minHeight: 94, textAlignVertical: 'top' }]} /></View>;
}
export function StateMessage({ icon = 'information-circle-outline', title, message, action, onAction }: { icon?: React.ComponentProps<typeof Ionicons>['name']; title: string; message: string; action?: string | undefined; onAction?: (() => void) | undefined }) {
  return <Card style={styles.stateCard}><View style={styles.stateIcon}><Ionicons name={icon} size={26} color={theme.colors.primary} /></View><Text accessibilityRole="header" style={styles.stateTitle}>{title}</Text><Text style={styles.stateBody}>{message}</Text>{action && onAction && <Button label={action} onPress={onAction} variant="secondary" />}</Card>;
}
export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: React.ComponentProps<typeof Ionicons>['name'] }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>{icon && <Ionicons name={icon} size={17} color={theme.colors.ink} />}<Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}
export function Divider() { return <View style={styles.divider} />; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background }, scroll: { flex: 1 }, content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32, gap: 24 }, contentCompact: { gap: 16 },
  topbar: { minHeight: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }, topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 }, back: { width: 44, height: 44, borderRadius: 11, backgroundColor: theme.colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderStrong },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandText: { fontSize: 23, fontWeight: '800', letterSpacing: -1.2, color: theme.colors.ink },
  heading: { gap: 7, paddingTop: 6 }, title: { fontSize: 26, lineHeight: 32, letterSpacing: -0.8, fontWeight: '700', color: theme.colors.ink }, subtitle: { fontSize: 15, lineHeight: 22, color: theme.colors.muted },
  card: { borderRadius: 16, padding: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, gap: 14 }, eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: theme.colors.muted, textTransform: 'uppercase' },
  sectionTitle: { gap: 4 }, sectionText: { fontSize: 18, lineHeight: 24, fontWeight: '700', letterSpacing: -0.3, color: theme.colors.ink }, sectionCaption: { color: theme.colors.muted, lineHeight: 20, fontSize: 14 },
  badge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 }, badge_mint: { backgroundColor: theme.colors.mint }, badge_peach: { backgroundColor: theme.colors.peach }, badge_neutral: { backgroundColor: theme.colors.background }, badge_error: { backgroundColor: theme.colors.errorSoft }, badgeText: { fontSize: 11, fontWeight: '700', color: theme.colors.ink },
  avatar: { alignItems: 'center', justifyContent: 'center' }, avatarText: { color: theme.colors.deep, fontWeight: '800' }, field: { gap: 7 }, fieldLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.ink }, input: { minHeight: 52, borderRadius: 11, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.white, fontSize: 16, color: theme.colors.ink },
  stateCard: { alignItems: 'center', paddingVertical: 28 }, stateIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: theme.colors.mint, alignItems: 'center', justifyContent: 'center' }, stateTitle: { textAlign: 'center', color: theme.colors.ink, fontSize: 19, fontWeight: '800' }, stateBody: { textAlign: 'center', color: theme.colors.muted, lineHeight: 21 },
  chip: { minHeight: 44, borderRadius: 11, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.borderStrong }, chipSelected: { backgroundColor: theme.colors.accent, borderColor: theme.colors.ink }, chipText: { color: theme.colors.ink, fontWeight: '700', fontSize: 13 }, chipTextSelected: { color: theme.colors.ink }, divider: { height: 1, backgroundColor: theme.colors.line }, footer: { textAlign: 'center', color: theme.colors.muted, fontSize: 11, paddingTop: 15 }
});
