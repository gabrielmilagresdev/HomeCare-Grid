import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Avatar, Badge, Card, Divider, Screen, SectionTitle, StateMessage } from '../../src/components/ui/Primitives';
import { splitSimulatedAmount } from '../../src/domain/rules/payments.ts';
import { useDemo } from '../../src/features/demo/DemoContext';
import { money, statusLabel, windowLabel } from '../../src/features/demo/format';
import { theme } from '../../src/theme/tokens';

export default function FamilySchedule() {
  const { engine, activeUserId, setPermission } = useDemo();
  const [error, setError] = useState('');
  const [showSplit, setShowSplit] = useState(false);
  const schedule = engine.listForRecipient(activeUserId ?? '');
  const memberships = engine.getMemberships(activeUserId ?? '');
  const owner = activeUserId === engine.fixture.recipient.ownerUserId;
  const family = memberships.ok ? memberships.data.find(item => item.userId === 'demo-family') : undefined;
  const canBook = owner || !!family?.canBook;
  const change = (permission: 'canBook' | 'canViewSchedule' | 'revoke', enabled?: boolean) => {
    const result = setPermission('demo-family', permission, enabled);
    setError(result.ok ? '' : result.error.message);
  };
  if (!schedule.ok) return <Screen back title="Agenda da família"><StateMessage icon="lock-closed-outline" title="Agenda protegida" message={schedule.error.message} action="Escolher outro acesso" onAction={() => router.push('/(auth)/sign-in')} /></Screen>;
  const bookings = [...schedule.data].reverse();
  return <Screen back title="Cuidar é trabalho de equipe." subtitle="Uma agenda compartilhada, com acesso definido por quem é responsável.">
    <Card style={{ backgroundColor: theme.colors.mint }}><Badge label="FAMILY HUB · DEMONSTRAÇÃO" /><Text style={styles.hero}>Todo mundo informado, cada um com sua permissão.</Text><Text style={styles.body}>Você está vendo a agenda de {engine.fixture.recipient.displayName}.</Text></Card>
    <View style={styles.group}><SectionTitle title="Próximos atendimentos" caption="Apenas vínculos ativos podem consultar esta agenda." />
      {bookings.length === 0 ? <StateMessage icon="calendar-outline" title="Ainda sem atendimentos" message="Quando um profissional aceitar uma solicitação, ela ficará visível aqui." action={canBook ? 'Buscar cuidado' : undefined} onAction={canBook ? () => router.push('/(patient)/home') : undefined} />
        : bookings.map(booking => {
          const professional = engine.fixture.professionals.find(item => item.id === booking.professionalId);
          const request = engine.getRequest(activeUserId ?? '', booking.id);
          const service = request.ok ? engine.fixture.services.find(item => item.id === request.data.serviceId) : undefined;
          return <Card key={booking.id}><View style={styles.row}><Avatar name={professional?.displayName ?? 'Profissional'} tone="peach" /><View style={{ flex: 1, gap: 4 }}><Text style={styles.name}>{professional?.displayName ?? 'Profissional'}</Text><Text style={styles.body}>{service?.name ?? 'Atendimento'}</Text></View><Badge label={statusLabel[booking.status]} tone={booking.status === 'accepted' ? 'mint' : 'peach'} /></View><Divider /><View style={styles.detail}><Ionicons name="time-outline" size={18} color={theme.colors.primary} /><Text style={styles.value}>{windowLabel(booking)}</Text></View><Text style={styles.note}>Exibido no horário de São Paulo.</Text>
            {booking.status === 'accepted' && <View style={styles.payment}><Pressable accessibilityRole="button" accessibilityLabel="Ver divisão simulada" onPress={() => setShowSplit(value => !value)} style={styles.paymentHead}><Ionicons name="wallet-outline" size={20} color={theme.colors.primary} /><Text style={styles.paymentTitle}>FamilyPay · SIMULAÇÃO</Text><Ionicons name={showSplit ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.primary} /></Pressable>{showSplit && (() => {
              const participants = family?.revokedAt === null ? ['demo-contractor', 'demo-family'] : ['demo-contractor'];
              const shares = splitSimulatedAmount(professional?.hourlyPriceCents ?? 0, participants);
              return shares.ok ? <View style={styles.shares}><Text style={styles.body}>Total fictício: {money(professional?.hourlyPriceCents ?? 0)}</Text>{shares.data.map(share => <Text key={share.userId} style={styles.value}>{share.userId === 'demo-family' ? 'Familiar' : 'Responsável'}: {money(share.amountCents)}</Text>)}<Text style={styles.note}>Sem pagamento, cartão ou transação.</Text></View> : null;
            })()}</View>}
          </Card>;
        })}</View>
    <View style={styles.group}><SectionTitle title="Quem pode acompanhar" caption="Permissões diferentes para ver e para solicitar." />
      <Card><View style={styles.row}><Avatar name="Rafa" tone="blue" /><View style={{ flex: 1 }}><Text style={styles.name}>Rafa · familiar fictício</Text><Text style={styles.body}>{family?.revokedAt ? 'Vínculo revogado' : family ? `${family.canViewSchedule ? 'Vê a agenda' : 'Sem leitura'} · ${family.canBook ? 'Pode solicitar' : 'Não solicita'}` : 'Vínculo indisponível'}</Text></View></View>
        {owner && family && !family.revokedAt && <><Divider /><Button label={family.canBook ? 'Retirar permissão de solicitar' : 'Permitir solicitar'} variant="secondary" onPress={() => change('canBook', !family.canBook)} /><Button label={family.canViewSchedule ? 'Retirar acesso à agenda' : 'Permitir ver agenda'} variant="ghost" onPress={() => change('canViewSchedule', !family.canViewSchedule)} /><Button label="Revogar vínculo" variant="danger" onPress={() => change('revoke')} /></>}
        {!owner && <Text style={styles.note}>Somente o responsável pode alterar estas permissões.</Text>}
      </Card></View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {canBook && <Button label="Solicitar outro atendimento" onPress={() => router.push('/(patient)/home')} />}
  </Screen>;
}
const styles = StyleSheet.create({ hero: { color: theme.colors.deep, fontSize: 24, lineHeight: 29, fontWeight: '800' }, body: { color: theme.colors.muted, fontSize: 12, lineHeight: 19 }, group: { gap: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, name: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' }, detail: { flexDirection: 'row', alignItems: 'center', gap: 8 }, value: { color: theme.colors.ink, fontSize: 13, lineHeight: 20, flex: 1 }, note: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 }, payment: { backgroundColor: theme.colors.background, borderRadius: 13, padding: 13, gap: 8 }, paymentHead: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40 }, paymentTitle: { color: theme.colors.primary, fontWeight: '800', fontSize: 13, flex: 1 }, shares: { gap: 6 }, error: { color: theme.colors.error, fontSize: 13, fontWeight: '700' } });
