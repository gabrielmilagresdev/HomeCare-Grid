import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../src/components/ui/Button';
import { DemoProvider, useDemo } from '../src/features/demo/DemoContext';
import { MarketplaceScreen } from '../src/features/marketplace/MarketplaceScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));

function ApplyExternalLimit() {
  const { search, setSearch } = useDemo();
  return <Button label="Reaplicar limite" onPress={() => setSearch({ ...search, maxPriceCents: 11000 })} />;
}

test('orçamento inválido bloqueia resultados e limite reaplicado aparece no campo', async () => {
  await render(<DemoProvider><MarketplaceScreen /><ApplyExternalLimit /></DemoProvider>);
  const field = screen.getByLabelText('Valor máximo por hora (R$, opcional)');
  expect(field.props.value).toBe('');
  expect(screen.getByText('Marina Azevedo')).toBeTruthy();

  await fireEvent.changeText(field, 'abc');
  expect(screen.getByRole('alert').props.children).toContain('Informe um valor');
  expect(screen.getByText('Confira o valor máximo')).toBeTruthy();
  expect(screen.queryByText('Ver opção de demanda')).toBeNull();

  await fireEvent.changeText(field, '100,50');
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByText('Marina Azevedo')).toBeTruthy();
  expect(screen.queryByText('Caio Martins')).toBeNull();

  await fireEvent.press(screen.getByRole('button', { name: 'Reaplicar limite' }));
  expect(screen.getByLabelText('Valor máximo por hora (R$, opcional)').props.value).toBe('110');
  expect(screen.getByText('Caio Martins')).toBeTruthy();

  await fireEvent.press(screen.getByRole('button', { name: 'Zona Norte' }));
  expect(screen.getByText('Por que estes perfis não aparecem?')).toBeTruthy();
  expect(screen.getAllByText(/Região não atendida/).length).toBeGreaterThan(0);
});
