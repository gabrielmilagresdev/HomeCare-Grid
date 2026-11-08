import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import AccessScreen from '../app/(auth)/sign-in';
import { DemoProvider } from '../src/features/demo/DemoContext';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));

test('cada profissional da vitrine pode assumir sua própria agenda na demonstração', async () => {
  await render(<DemoProvider><AccessScreen /></DemoProvider>);
  for (const name of ['Marina Azevedo', 'Caio Martins', 'Lia Ferreira', 'Nina Ribeiro']) {
    expect(screen.getByRole('button', { name: `Entrar como ${name}` })).toBeTruthy();
  }
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar como Caio Martins' }));
  expect(screen.getByText('Explorando como Caio')).toBeTruthy();
  expect(router.replace).toHaveBeenCalledWith('/(professional)/agenda');
});
