import { router } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { BottomNavigation } from '../../src/components/ui/BottomNavigation';
import { Avatar, Badge, Card, Screen, SectionTitle } from '../../src/components/ui/Primitives';
import { useDemo } from '../../src/features/demo/DemoContext';
import { theme } from '../../src/theme/tokens';

export default function AccessScreen() {
  const { engine, user, setActiveUserId } = useDemo();
  return <Screen back title="Acesso à demonstração" subtitle="Papéis fictícios ajudam a explorar a experiência. Nenhum login ou dado pessoal é necessário." bottom={<BottomNavigation active="account" />}>
    <Card style={{ backgroundColor: theme.colors.mint }}><Badge label="SESSÃO LOCAL" /><Text style={styles.cardTitle}>{user ? `Explorando como ${user.displayName}` : 'Sem sessão ativa'}</Text><Text style={styles.body}>A troca de papel abaixo vale apenas nesta simulação. No produto real, permissões são verificadas no servidor por pessoa e ação.</Text></Card>
    <View style={styles.group}><SectionTitle title="Pessoa e família" /><Button label="Pessoa atendida / responsável" onPress={() => { setActiveUserId('demo-contractor'); router.replace('/(patient)/home'); }} />
      <Button label="Familiar Rafa" variant="ghost" onPress={() => { setActiveUserId('demo-family'); router.replace('/(family)/schedule'); }} />
      <Button label="Sair da demonstração" variant="ghost" onPress={() => { setActiveUserId(null); router.replace('/'); }} /></View>
    <View style={styles.group}><SectionTitle title="Profissionais fictícios" caption="Escolha o perfil que recebeu a solicitação para responder na agenda." />
      {engine.fixture.professionals.map(professional => <Card key={professional.id}>
        <View style={styles.professionalRow}><Avatar name={professional.displayName} tone="peach" /><View style={styles.professionalInfo}><Text style={styles.professionalName}>{professional.displayName}</Text><Text style={styles.body}>{professional.serviceIds.map(id => engine.fixture.services.find(service => service.id === id)?.name).filter(Boolean).join(' · ')}</Text><Text style={styles.credential}>{professional.credentialStatus === 'verified' ? 'Credencial marcada na demo' : 'Credencial não verificada'}</Text></View></View>
        <Button label={`Entrar como ${professional.displayName}`} variant="secondary" onPress={() => { setActiveUserId(professional.userId); router.replace('/(professional)/agenda'); }} />
      </Card>)}
    </View>
    <Card><Text style={styles.cardTitle}>Privacidade por padrão</Text><Text style={styles.body}>A agenda familiar exige vínculo ativo. A demanda sem cobertura só é registrada após consentimento. Pagamentos são exclusivamente simulados.</Text></Card>
  </Screen>;
}
const styles = StyleSheet.create({ group: { gap: 10 }, cardTitle: { color: theme.colors.ink, fontSize: 20, fontWeight: '800' }, body: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 }, professionalRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, professionalInfo: { flex: 1, gap: 3 }, professionalName: { color: theme.colors.ink, fontSize: 16, fontWeight: '800' }, credential: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' } });
