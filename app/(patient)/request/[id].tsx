import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../src/components/ui/Button';
import { Avatar, Badge, Card, Divider, Screen, SectionTitle, StateMessage } from '../../../src/components/ui/Primitives';
import type { CareRequest } from '../../../src/domain/types/index.ts';
import { useDemo } from '../../../src/features/demo/DemoContext';
import { money, regionLabel, windowLabel } from '../../../src/features/demo/format';
import { createDemoKey } from '../../../src/services/demo/ids.ts';
import { theme } from '../../../src/theme/tokens';

export default function RequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { engine, user, activeUserId, search, request } = useDemo();
  const [error, setError] = useState('');
  const key = useRef<string | null>(null);
  const submitting = useRef(false);
  const professional = engine.fixture.professionals.find(item => item.id === id);
  const service = engine.fixture.services.find(item => item.id === search.serviceId);
  const memberships = engine.getMemberships(activeUserId ?? '');
  const canBook = activeUserId === engine.fixture.recipient.ownerUserId || (memberships.ok && memberships.data.some(item => item.userId === activeUserId && item.canBook && item.revokedAt === null));
  if (!professional || !service) return <Screen back title="Solicitação"><StateMessage title="Seleção indisponível" message="Volte à busca para escolher um profissional." /></Screen>;
  const submit = () => {
    if (submitting.current) return;
    submitting.current = true;
    if (!key.current) key.current = createDemoKey();
    const input: CareRequest = { id: key.current, recipientId: engine.fixture.recipient.id, requesterUserId: activeUserId ?? '', serviceId: service.id,
      regionCode: search.regionCode, startsAt: search.window.startsAt, endsAt: search.window.endsAt, requiredAccessibilityTags: search.accessibilityTags, maxPriceCents: search.maxPriceCents };
    const result = request(input, professional.id, key.current);
    submitting.current = false;
    if (!result.ok) { setError(result.error.message); return; }
    router.replace('/(patient)/bookings');
  };
  return <Screen back title="Revise sua solicitação" subtitle="Confira as informações antes de enviar para o profissional.">
    <Card><View style={styles.head}><Avatar name={professional.displayName} tone="peach" /><View style={{ flex: 1 }}><Text style={styles.name}>{professional.displayName}</Text><Text style={styles.muted}>{service.name}</Text></View></View><Divider />
      <View style={styles.line}><Ionicons name="location-outline" size={20} color={theme.colors.primary} /><Text style={styles.value}>{regionLabel(search.regionCode)}</Text></View>
      <View style={styles.line}><Ionicons name="calendar-outline" size={20} color={theme.colors.primary} /><Text style={styles.value}>{windowLabel(search.window)}</Text></View>
      <View style={styles.line}><Ionicons name="person-outline" size={20} color={theme.colors.primary} /><Text style={styles.value}>{engine.fixture.recipient.displayName}</Text></View>
    </Card>
    <Card style={{ backgroundColor: theme.colors.mint }}><SectionTitle title="Valor estimado" /><Text style={styles.price}>{money(professional.hourlyPriceCents)} <Text style={styles.muted}>/ hora</Text></Text><Text style={styles.muted}>Valor demonstrativo. Nenhuma cobrança é feita.</Text></Card>
    <Card><Badge label="COMO FUNCIONA" /><Text style={styles.value}>Ao enviar, a solicitação fica pendente. O profissional poderá aceitar ou recusar. A confirmação aparece na agenda da pessoa e da família autorizada.</Text></Card>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!canBook && <StateMessage icon="lock-closed-outline" title="Permissão necessária" message={user ? 'Este perfil não pode solicitar para a pessoa selecionada.' : 'Escolha um papel antes de solicitar.'} action="Escolher papel" onAction={() => router.push('/(auth)/sign-in')} />}
    <Button label="Enviar solicitação" onPress={submit} disabled={!canBook} />
    <Button label="Voltar e ajustar filtros" onPress={() => router.back()} variant="ghost" />
  </Screen>;
}
const styles = StyleSheet.create({ head: { flexDirection: 'row', alignItems: 'center', gap: 12 }, name: { fontSize: 17, fontWeight: '800', color: theme.colors.ink }, muted: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 }, line: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' }, value: { flex: 1, color: theme.colors.ink, fontSize: 14, lineHeight: 21 }, price: { color: theme.colors.deep, fontSize: 29, fontWeight: '800' }, error: { color: theme.colors.error, fontSize: 13, fontWeight: '700', lineHeight: 19 } });
