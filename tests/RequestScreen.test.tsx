import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Text } from 'react-native';
import RequestScreen from '../app/(patient)/request/[id]';
import { DemoProvider, useDemo } from '../src/features/demo/DemoContext';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'demo-professional-a' }) }));

function BookingCount() {
  const { engine, activeUserId, revision } = useDemo();
  const result = engine.listForRecipient(activeUserId ?? '');
  return <Text>{revision >= 0 && result.ok ? `Pedidos: ${result.data.length}` : 'Agenda indisponível'}</Text>;
}

test('trocar para região sem cobertura invalida a escolha e preserva o restante', async () => {
  await render(<DemoProvider><RequestScreen /><BookingCount /></DemoProvider>);
  expect(screen.getByText('Marina Azevedo')).toBeTruthy();
  expect(screen.getByText('Pedidos: 0')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Alterar endereço' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Escolher Zona Norte' }));
  expect(screen.getByText('Escolha outro horário ou local')).toBeTruthy();
  expect(screen.getByRole('button', { name: /Simular (solicitação|pedido)/ }).props.accessibilityState.disabled).toBe(true);
  expect(screen.getByText('Pedidos: 0')).toBeTruthy();
});

test('duplo envio usa a mesma chave e cria uma solicitação pendente', async () => {
  await render(<DemoProvider><RequestScreen /><BookingCount /></DemoProvider>);
  const action = screen.getByRole('button', { name: /Simular (solicitação|pedido)/ });
  await fireEvent.press(action);
  await fireEvent.press(action);
  expect(screen.getByText('Pedidos: 1')).toBeTruthy();
  expect(router.replace).toHaveBeenCalledWith('/(patient)/bookings');
});
