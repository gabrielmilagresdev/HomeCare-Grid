import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { Button } from '../src/components/ui/Button';
import { DemoProvider, useDemo } from '../src/features/demo/DemoContext';
import { MarketplaceScreen } from '../src/features/marketplace/MarketplaceScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));

function Controls() {
  const { search, setSearch, applyIntent, engine } = useDemo();
  return <><Button label="Reaplicar limite" onPress={() => setSearch({ ...search, maxPriceCents: 11000 })} />
    <Button label="Buscar pós-operatório" onPress={() => applyIntent('Pós-operatório')} />
    <Button label="Buscar fisioterapia" onPress={() => applyIntent('Fisioterapia no Centro amanhã de manhã')} />
    <Text>{search.window.startsAt === engine.fixture.alternateWindow.startsAt ? 'Horário alternativo escolhido' : 'Horário inicial escolhido'}</Text>
  </>;
}

test('preço inválido bloqueia resultados e atualização externa mantém o filtro visível', async () => {
  await render(<DemoProvider><MarketplaceScreen /><Controls /></DemoProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Preço' }));
  const field = screen.getByLabelText('Valor máximo por hora (R$, opcional)');
  expect(field.props.value).toBe('');
  expect(screen.getByText('Marina Azevedo')).toBeTruthy();

  await fireEvent.changeText(field, 'abc');
  expect(screen.getByRole('alert').props.children).toContain('Informe um valor');
  expect(screen.getByText('Confira o valor máximo')).toBeTruthy();

  await fireEvent.changeText(field, '100,50');
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByText('Marina Azevedo')).toBeTruthy();
  expect(screen.queryByText('Caio Martins')).toBeNull();

  await fireEvent.press(screen.getByRole('button', { name: 'Reaplicar limite' }));
  expect(screen.getByLabelText('Valor máximo por hora (R$, opcional)').props.value).toBe('110');
  expect(screen.getByText('Caio Martins')).toBeTruthy();

  await fireEvent.press(screen.getByRole('button', { name: 'Mais filtros' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Zona Norte' }));
  expect(screen.getByText('Não encontramos horários com esses filtros.')).toBeTruthy();
  expect(screen.getByText('Registrar demanda voluntariamente')).toBeTruthy();
});

test('pós-operatório exige serviço; escolha explícita e horário seguem para o perfil', async () => {
  await render(<DemoProvider><MarketplaceScreen /><Controls /></DemoProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Buscar pós-operatório' }));
  expect(screen.getByText('Qual cuidado você procura?')).toBeTruthy();
  expect(screen.queryByText('Marina Azevedo')).toBeNull();

  await fireEvent.press(screen.getByRole('button', { name: 'Buscar fisioterapia' }));
  expect(screen.getByText('Caio Martins')).toBeTruthy();
  expect(screen.queryByText('Marina Azevedo')).toBeNull();
  const slots = screen.getAllByRole('button', { name: /Escolher .* com Caio Martins/ });
  expect(slots.length).toBe(2);
  await fireEvent.press(slots[1]!);
  expect(screen.getByText('Horário alternativo escolhido')).toBeTruthy();
  expect(router.push).toHaveBeenCalledWith('/(patient)/profile/demo-professional-b');
});
