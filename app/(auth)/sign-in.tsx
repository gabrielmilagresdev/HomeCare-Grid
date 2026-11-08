import { router } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Badge, Card, Screen, SectionTitle } from '../../src/components/ui/Primitives';
import { useDemo } from '../../src/features/demo/DemoContext';
import { theme } from '../../src/theme/tokens';

export default function AccessScreen() {
  const { user, setActiveUserId } = useDemo();
  return <Screen back title="Acesso à demonstração" subtitle="Papéis fictícios ajudam a explorar a experiência. Nenhum login ou dado pessoal é necessário.">
    <Card style={{ backgroundColor: theme.colors.mint }}><Badge label="SESSÃO LOCAL" /><Text style={styles.cardTitle}>{user ? `Explorando como ${user.displayName}` : 'Sem sessão ativa'}</Text><Text style={styles.body}>A troca de papel abaixo vale apenas nesta simulação. No produto real, permissões são verificadas no servidor por pessoa e ação.</Text></Card>
    <View style={styles.group}><SectionTitle title="Escolha um papel" /><Button label="Pessoa atendida / responsável" onPress={() => { setActiveUserId('demo-contractor'); router.replace('/(patient)/home'); }} />
      <Button label="Profissional Marina" variant="secondary" onPress={() => { setActiveUserId('demo-pro-a'); router.replace('/(professional)/agenda'); }} />
      <Button label="Familiar Rafa (somente leitura)" variant="ghost" onPress={() => { setActiveUserId('demo-family'); router.replace('/(family)/schedule'); }} />
      <Button label="Sair da demonstração" variant="ghost" onPress={() => { setActiveUserId(null); router.replace('/'); }} /></View>
    <Card><Text style={styles.cardTitle}>Privacidade por padrão</Text><Text style={styles.body}>A agenda familiar exige vínculo ativo. A demanda sem cobertura só é registrada após consentimento. Pagamentos são exclusivamente simulados.</Text></Card>
  </Screen>;
}
const styles = StyleSheet.create({ group: { gap: 10 }, cardTitle: { color: theme.colors.ink, fontSize: 20, fontWeight: '800' }, body: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 } });
