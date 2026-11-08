import { router } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui/Button';
import { styles } from '../src/components/common/FoundationScreen';
export default function Home() {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text accessibilityRole="header" style={styles.brand}>HomeCare Grid</Text>
    <Text style={styles.slogan}>O cuidado certo, onde você está.</Text>
    <Text style={styles.body}>Uma base para conectar pessoas a cuidado e apoio domiciliar.</Text>
    <Text style={styles.notice}>Ambiente sintético. A seleção abaixo demonstra a navegação; não concede permissões.</Text>
    <Button label="Pessoa atendida ou contratante" onPress={() => router.push('/(patient)/home')} />
    <Button label="Profissional independente" onPress={() => router.push('/(professional)/agenda')} />
    <Button label="Familiar autorizado" onPress={() => router.push('/(family)/schedule')} />
    <Button label="Sobre o acesso" onPress={() => router.push('/(auth)/sign-in')} />
  </ScrollView></SafeAreaView>;
}
