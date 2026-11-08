import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Badge, Card, Screen, StateMessage } from '../../src/components/ui/Primitives';
import { useDemo } from '../../src/features/demo/DemoContext';
import { regionLabel } from '../../src/features/demo/format';
import { theme } from '../../src/theme/tokens';

export default function DemandScreen() {
  const { engine, search, recordDemand, revokeConsent } = useDemo();
  const [consent, setConsent] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [error, setError] = useState('');
  const service = engine.fixture.services.find(item => item.id === search.serviceId);
  const send = () => {
    const result = recordDemand(search.serviceId, search.regionCode, consent);
    if (result.ok) { setRecorded(true); setError(''); }
    else setError(result.error.message);
  };
  return <Screen back title="Ainda sem cobertura?" subtitle="Você pode sinalizar interesse de forma voluntária e mínima.">
    <Card style={{ backgroundColor: theme.colors.peach }}><Badge label="INTERESSE POR CUIDADO" tone="peach" /><Text style={styles.hero}>Sua necessidade ajuda a revelar oportunidades.</Text><Text style={styles.body}>Apenas serviço e região entram no registro. Nada de endereço, contato, texto livre ou informação clínica.</Text></Card>
    <Card><Text style={styles.label}>INTERESSE SELECIONADO</Text><Text style={styles.summary}>{service?.name ?? 'Serviço'}</Text><View style={styles.detail}><Ionicons name="location-outline" size={18} color={theme.colors.primary} /><Text style={styles.body}>{regionLabel(search.regionCode)}</Text></View></Card>
    {recorded ? <StateMessage icon="checkmark-circle-outline" title="Interesse registrado" message="Obrigado! O registro fica neste aparelho enquanto o app está aberto." action="Voltar à busca" onAction={() => router.replace('/(patient)/home')} />
      : <Card><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consent }} accessibilityLabel="Concordo em registrar interesse administrativo" onPress={() => setConsent(value => !value)} style={styles.consentRow}><View style={[styles.checkbox, consent && styles.checked]}>{consent && <Ionicons name="checkmark" size={16} color={theme.colors.white} />}</View><Text style={styles.consentText}>Concordo em registrar meu interesse administrativo para esta região e serviço. Posso revogar durante esta sessão.</Text></Pressable>
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}<Button label="Registrar interesse" disabled={!consent} onPress={send} /><Button label="Agora não" variant="ghost" onPress={() => router.back()} /></Card>}
    <Button label="Revogar consentimento desta sessão" variant="ghost" onPress={() => { revokeConsent(); setRecorded(false); setConsent(false); }} />
  </Screen>;
}
const styles = StyleSheet.create({ hero: { color: theme.colors.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.6, lineHeight: 29 }, body: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 }, label: { color: theme.colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }, summary: { color: theme.colors.ink, fontSize: 19, fontWeight: '800' }, detail: { flexDirection: 'row', gap: 7, alignItems: 'center' }, consentRow: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', minHeight: 55 }, checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: theme.colors.primary }, consentText: { flex: 1, color: theme.colors.ink, fontSize: 13, lineHeight: 20 }, error: { color: theme.colors.error, fontWeight: '700', fontSize: 12 } });
