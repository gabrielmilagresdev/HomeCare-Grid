import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Avatar, Badge, Card, Divider, Screen, SectionTitle, StateMessage } from '../../src/components/ui/Primitives';
import { useDemo } from '../../src/features/demo/DemoContext';
import { money, statusLabel, windowLabel } from '../../src/features/demo/format';
import { theme } from '../../src/theme/tokens';

export default function PatientBookings() {
  const { engine, activeUserId, setSearch, search, transition } = useDemo();
  const [error, setError] = useState('');
  const result = engine.listForRecipient(activeUserId ?? '');
  const bookings = result.ok ? [...result.data].reverse() : [];
  const cancel = (bookingId: string, version: number) => {
    const outcome = transition(bookingId, 'cancelled', version);
    setError(outcome.ok ? '' : outcome.error.message);
  };
  const repeat = (bookingId: string, professionalId: string) => {
    const request = engine.getRequest(activeUserId ?? '', bookingId);
    if (!request.ok) { setError(request.error.message); return; }
    setSearch({ ...search, serviceId: request.data.serviceId, regionCode: request.data.regionCode,
      window: engine.fixture.alternateWindow, accessibilityTags: request.data.requiredAccessibilityTags, maxPriceCents: request.data.maxPriceCents });
    router.push(`/(patient)/profile/${professionalId}`);
  };
  return <Screen back title="Minha agenda" subtitle="Acompanhe solicitações e confirmações da pessoa atendida.">
    <Card style={{ backgroundColor: theme.colors.mint }}><Badge label="AGENDA COMPARTILHÁVEL" /><Text style={styles.lead}>Cada atualização aparece para quem tem permissão ativa.</Text><Text style={styles.muted}>Horários exibidos no fuso de São Paulo. Todos os dados são fictícios.</Text></Card>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!result.ok ? <StateMessage icon="lock-closed-outline" title="Agenda protegida" message={result.error.message} action="Escolher acesso" onAction={() => router.push('/(auth)/sign-in')} />
      : bookings.length === 0 ? <StateMessage icon="calendar-outline" title="Sua agenda está livre" message="Depois de solicitar um atendimento, você verá o andamento aqui." action="Explorar profissionais" onAction={() => router.push('/(patient)/home')} />
        : <View style={styles.list}><SectionTitle title="Atendimentos" caption={`${bookings.length} registro${bookings.length === 1 ? '' : 's'} na demonstração`} />{bookings.map(booking => {
          const professional = engine.fixture.professionals.find(item => item.id === booking.professionalId);
          const request = engine.getRequest(activeUserId ?? '', booking.id);
          const service = request.ok ? engine.fixture.services.find(item => item.id === request.data.serviceId) : undefined;
          return <Card key={booking.id}><View style={styles.row}><Avatar name={professional?.displayName ?? 'Profissional'} tone="peach" /><View style={{ flex: 1, gap: 4 }}><Text style={styles.name}>{professional?.displayName ?? 'Profissional'}</Text><Text style={styles.muted}>{service?.name ?? 'Atendimento'}</Text></View><Badge label={statusLabel[booking.status]} tone={booking.status === 'accepted' ? 'mint' : booking.status === 'requested' ? 'peach' : 'neutral'} /></View>
            <Divider /><View style={styles.detail}><Ionicons name="calendar-outline" size={18} color={theme.colors.primary} /><Text style={styles.value}>{windowLabel(booking)}</Text></View><View style={styles.detail}><Ionicons name="wallet-outline" size={18} color={theme.colors.primary} /><Text style={styles.value}>{money(professional?.hourlyPriceCents ?? 0)} / hora · simulado</Text></View>
            {booking.status === 'requested' && <Text style={styles.muted}>Aguardando resposta do profissional. Troque de papel na tela inicial para demonstrar o aceite.</Text>}
            {(booking.status === 'requested' || booking.status === 'accepted') && <Button label="Cancelar solicitação" variant="ghost" onPress={() => cancel(booking.id, booking.version)} />}
            {['rejected', 'cancelled', 'completed'].includes(booking.status) && <Button label="Solicitar novamente" variant="secondary" onPress={() => repeat(booking.id, booking.professionalId)} />}
          </Card>;
        })}</View>}
    <Button label="Buscar profissionais" variant="secondary" onPress={() => router.push('/(patient)/home')} />
    <Button label="Ver agenda da família" variant="ghost" onPress={() => router.push('/(family)/schedule')} />
  </Screen>;
}
const styles = StyleSheet.create({ lead: { color: theme.colors.deep, fontSize: 17, fontWeight: '800', lineHeight: 23 }, muted: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 }, error: { color: theme.colors.error, fontSize: 13, fontWeight: '700' }, list: { gap: 13 }, row: { flexDirection: 'row', gap: 10, alignItems: 'center' }, name: { color: theme.colors.ink, fontSize: 16, fontWeight: '800' }, detail: { flexDirection: 'row', alignItems: 'center', gap: 9 }, value: { color: theme.colors.ink, fontSize: 13, lineHeight: 19, flex: 1 } });
