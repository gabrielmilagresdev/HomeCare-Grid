import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../src/components/ui/Button';
import { Avatar, Badge, Card, Divider, Eyebrow, Screen, SectionTitle, StateMessage } from '../../../src/components/ui/Primitives';
import { evaluateProfessional } from '../../../src/domain/rules/matching.ts';
import type { CareRequest } from '../../../src/domain/types/index.ts';
import { useDemo } from '../../../src/features/demo/DemoContext';
import { money, regionLabel, windowLabel } from '../../../src/features/demo/format';
import { theme } from '../../../src/theme/tokens';

export default function ProfessionalProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { engine, activeUserId, search } = useDemo();
  const professional = engine.fixture.professionals.find(item => item.id === id);
  const service = engine.fixture.services.find(item => item.id === search.serviceId);
  if (!professional || !service) return <Screen back title="Perfil indisponível"><StateMessage title="Perfil não encontrado" message="Volte à busca e escolha outro profissional." /></Screen>;
  const draft: CareRequest = { id: 'demo-preview', recipientId: engine.fixture.recipient.id, requesterUserId: activeUserId ?? '', serviceId: service.id, regionCode: search.regionCode,
    startsAt: search.window.startsAt, endsAt: search.window.endsAt, requiredAccessibilityTags: search.accessibilityTags, maxPriceCents: search.maxPriceCents };
  const evaluation = evaluateProfessional(draft, service, professional);
  return <Screen back title="Conheça o profissional" subtitle="Informações administrativas para apoiar sua escolha.">
    <Card style={{ paddingVertical: 26 }}><View style={styles.profile}><Avatar name={professional.displayName} tone="peach" size={74} /><Text accessibilityRole="header" style={styles.name}>{professional.displayName}</Text><Text style={styles.subtitle}>{professional.serviceIds.map(serviceId => engine.fixture.services.find(item => item.id === serviceId)?.name).filter(Boolean).join(' · ')}</Text><Badge label={professional.credentialStatus === 'verified' ? 'CREDENCIAL MARCADA NA DEMO' : 'CREDENCIAL NÃO VERIFICADA'} tone={professional.credentialStatus === 'verified' ? 'mint' : 'neutral'} /></View>
      <Divider /><View style={styles.details}><View style={styles.detail}><Ionicons name="location-outline" size={19} color={theme.colors.primary} /><Text style={styles.detailText}>{professional.regionCodes.map(regionLabel).join(' · ')}</Text></View><View style={styles.detail}><Ionicons name="time-outline" size={19} color={theme.colors.primary} /><Text style={styles.detailText}>Horários sob consulta na demonstração</Text></View><View style={styles.detail}><Ionicons name="accessibility-outline" size={19} color={theme.colors.primary} /><Text style={styles.detailText}>{professional.accessibilityTags.length ? professional.accessibilityTags.map(tag => tag === 'mobilidade' ? 'Apoio à mobilidade' : 'Comunicação acessível').join(' · ') : 'Sem especialidade de acessibilidade informada'}</Text></View></View>
    </Card>
    <View style={styles.group}><SectionTitle title="Seu pedido" /><Card style={{ backgroundColor: theme.colors.mint }}><Eyebrow>FILTROS CONFIRMADOS POR VOCÊ</Eyebrow><Text style={styles.summary}>{service.name}</Text><Text style={styles.detailText}>{regionLabel(search.regionCode)} · {windowLabel(search.window)}</Text><Text style={styles.price}>{money(professional.hourlyPriceCents)} <Text style={styles.perHour}>por hora · valor fictício</Text></Text></Card></View>
    <Card><Text style={styles.summary}>{evaluation.eligible ? 'Por que aparece aqui?' : 'Por que não está disponível?'}</Text><Text style={styles.detailText}>{evaluation.reasons.join(' · ')}</Text><Text style={styles.note}>O resultado não indica qualidade clínica nem recomendação médica.</Text></Card>
    <Button label="Solicitar atendimento" disabled={!evaluation.eligible} onPress={() => router.push(`/(patient)/request/${professional.id}`)} />
  </Screen>;
}
const styles = StyleSheet.create({ profile: { alignItems: 'center', gap: 9 }, name: { fontSize: 24, fontWeight: '800', color: theme.colors.ink, textAlign: 'center' }, subtitle: { color: theme.colors.muted, textAlign: 'center', lineHeight: 20 }, details: { gap: 14 }, detail: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, detailText: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, flex: 1 }, group: { gap: 12 }, summary: { fontSize: 17, fontWeight: '800', color: theme.colors.ink }, price: { color: theme.colors.deep, fontWeight: '800', fontSize: 23 }, perHour: { color: theme.colors.muted, fontSize: 12, fontWeight: '500' }, note: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 } });
