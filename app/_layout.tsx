import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoProvider } from '../src/features/demo/DemoContext';
import { theme } from '../src/theme/tokens';
export default function RootLayout() {
  return <SafeAreaProvider><DemoProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} /></DemoProvider></SafeAreaProvider>;
}
