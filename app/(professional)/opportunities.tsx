import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, Card, Screen, SectionTitle, StateMessage } from '../../src/components/ui/Primitives';
import { useDemo } from '../../src/features/demo/DemoContext';
import { regionLabel } from '../../src/features/demo/format';
import { theme } from '../../src/theme/tokens';

export default function Opportunities() {
  const { engine, activeUserId, user } = useDemo();
  const result = engine.listDemandAggregates(activeUserId ?? '');
  if (!user?.roles.includes('professional') || !result.ok) return <Screen back title="Oportunidades"><StateMessage icon="lock-closed-outline" title="Acesso restrito" message="Esta visão exige o papel profissional fictício." /></Screen>;
  return <Screen back title="Oportunidades na rede" subtitle="Sinais administrativos agregados, sem identificar pessoas.">
    <Card style={{ backgroundColor: theme.colors.blue }}><Badge label="GRID DEMAND · SIMULAÇÃO" tone="neutral" /><Text style={styles.hero}>Onde o cuidado pode fazer diferença?</Text><Text style={styles.body}>Apenas grupos com pelo menos cinco interesses ativos aparecem. Não exibimos endereço, contato ou texto livre.</Text></Card>
    <View style={styles.group}><SectionTitle title="Regiões com interesse" caption="Exemplos sintéticos para a demonstração." />{result.data.length === 0 ? <StateMessage title="Sem grupos suficientes" message="A privacidade impede a exibição de grupos pequenos." /> : result.data.map(item => <Card key={`${item.serviceId}:${item.regionCode}`}><View style={styles.row}><View style={styles.icon}><Ionicons name="analytics-outline" size={22} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.name}>{engine.fixture.services.find(service => service.id === item.serviceId)?.name ?? 'Serviço'}</Text><Text style={styles.body}>{regionLabel(item.regionCode)}</Text></View><Text style={styles.count}>{item.count}+</Text></View><Text style={styles.note}>Interesses fictícios agregados · nenhuma pessoa identificável</Text></Card>)}</View>
  </Screen>;
}
const styles = StyleSheet.create({ hero: { color: theme.colors.ink, fontSize: 24, lineHeight: 29, fontWeight: '800' }, body: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 }, group: { gap: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 48, height: 48, borderRadius: 15, backgroundColor: theme.colors.mint, alignItems: 'center', justifyContent: 'center' }, name: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' }, count: { color: theme.colors.primary, fontSize: 24, fontWeight: '800' }, note: { color: theme.colors.muted, fontSize: 11 } });
