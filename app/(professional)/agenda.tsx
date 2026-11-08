import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Avatar, Badge, Card, Divider, Screen, SectionTitle, StateMessage } from '../../src/components/ui/Primitives';
import { useDemo } from '../../src/features/demo/DemoContext';
import { regionLabel, statusLabel, windowLabel } from '../../src/features/demo/format';
import { theme } from '../../src/theme/tokens';

export default function ProfessionalAgenda() {
  const { engine, activeUserId, user, transition } = useDemo();
  const [error, setError] = useState('');
  const professional = engine.fixture.professionals.find(item => item.userId === activeUserId);
  const result = engine.listForProfessional(activeUserId ?? '');
  const bookings = result.ok ? [...result.data].reverse() : [];
  const act = (id: string, to: 'accepted' | 'rejected', version: number) => {
    const outcome = transition(id, to, version);
    setError(outcome.ok ? '' : outcome.error.message);
  };
  if (!professional || !result.ok) return <Screen back title="Agenda profissional"><StateMessage icon="lock-closed-outline" title="Acesso restrito" message="Escolha o perfil profissional fictício para visualizar esta agenda." action="Trocar perfil" onAction={() => router.push('/(auth)/sign-in')} /></Screen>;
  return <Screen back title={`Bom dia, ${user?.displayName ?? 'profissional'}.`} subtitle="Aqui você acompanha solicitações e confirmações." right={<Pressable accessibilityRole="button" accessibilityLabel="Ver oportunidades" onPress={() => router.push('/(professional)/opportunities')} style={styles.topAction}><Ionicons name="trending-up-outline" size={20} color={theme.colors.primary} /></Pressable>}>
    <Card style={{ backgroundColor: theme.colors.peach }}><Badge label="SEU ESPAÇO PROFISSIONAL" tone="peach" /><Text style={styles.hero}>Cuidado com autonomia, agenda com clareza.</Text><Text style={styles.muted}>Somente solicitações dirigidas ao seu perfil aparecem aqui.</Text></Card>
    <View style={styles.stats}><Card style={styles.statCard}><Text style={styles.statNumber}>{bookings.filter(item => item.status === 'requested').length}</Text><Text style={styles.statLabel}>Aguardando resposta</Text></Card><Card style={styles.statCard}><Text style={styles.statNumber}>{bookings.filter(item => item.status === 'accepted').length}</Text><Text style={styles.statLabel}>Confirmados</Text></Card></View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <View style={styles.list}><SectionTitle title="Solicitações" caption="Aceite ou recuse com uma confirmação por vez." />
      {bookings.length === 0 ? <StateMessage icon="calendar-outline" title="Tudo tranquilo por aqui" message="Faça uma solicitação no perfil da pessoa e volte como profissional para demonstrar o fluxo completo." action="Ir à experiência da pessoa" onAction={() => router.push('/')} />
        : bookings.map(booking => {
          const request = engine.getRequest(activeUserId ?? '', booking.id);
          const service = request.ok ? engine.fixture.services.find(item => item.id === request.data.serviceId) : undefined;
          return <Card key={booking.id}><View style={styles.row}><Avatar name="Pessoa fictícia" tone="mint" /><View style={{ flex: 1, gap: 4 }}><Text style={styles.name}>{engine.fixture.recipient.displayName}</Text><Text style={styles.muted}>{service?.name ?? 'Atendimento'} · {request.ok ? regionLabel(request.data.regionCode) : ''}</Text></View></View><Badge label={statusLabel[booking.status]} tone={booking.status === 'accepted' ? 'mint' : booking.status === 'requested' ? 'peach' : 'neutral'} /><Divider /><View style={styles.detail}><Ionicons name="time-outline" size={19} color={theme.colors.primary} /><Text style={styles.value}>{windowLabel(booking)}</Text></View>
            {booking.status === 'requested' && <View style={styles.actions}><Button label="Aceitar" onPress={() => act(booking.id, 'accepted', booking.version)} /><Button label="Recusar" variant="ghost" onPress={() => act(booking.id, 'rejected', booking.version)} /></View>}
            {booking.status === 'accepted' && <Text style={styles.muted}>Horário reservado na demonstração. Solicitações sobrepostas não podem ser aceitas.</Text>}
          </Card>;
        })}</View>
    <Button label="Ver demanda agregada" variant="secondary" onPress={() => router.push('/(professional)/opportunities')} />
  </Screen>;
}
const styles = StyleSheet.create({ topAction: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.line }, hero: { color: theme.colors.ink, fontSize: 24, lineHeight: 29, fontWeight: '800' }, muted: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 }, stats: { flexDirection: 'row', gap: 10 }, statCard: { flex: 1, alignItems: 'center', paddingVertical: 18 }, statNumber: { color: theme.colors.deep, fontSize: 28, fontWeight: '800' }, statLabel: { color: theme.colors.muted, fontSize: 11, textAlign: 'center' }, error: { color: theme.colors.error, fontSize: 13, fontWeight: '700' }, list: { gap: 13 }, row: { flexDirection: 'row', alignItems: 'center', gap: 11 }, name: { color: theme.colors.ink, fontWeight: '800', fontSize: 15 }, detail: { flexDirection: 'row', alignItems: 'center', gap: 9 }, value: { flex: 1, color: theme.colors.ink, fontSize: 13 }, actions: { flexDirection: 'row', gap: 8 } });
