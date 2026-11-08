import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { DemoProvider, useDemo } from '../src/features/demo/DemoContext';
import { ConciergeHomeScreen } from '../src/features/marketplace/ConciergeHomeScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));

function SearchState() {
  const { intent, search, serviceChoiceRequired } = useDemo();
  return <Text>{`${intent}|${search.serviceId}|${serviceChoiceRequired ? 'esclarecer' : 'definido'}`}</Text>;
}

test('sugestões levam à busca sem inferir especialidade para pós-operatório', async () => {
  await render(<DemoProvider><ConciergeHomeScreen /><SearchState /></DemoProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Fisioterapia' }));
  expect(screen.getByText('Fisioterapia|demo-service-physio|definido')).toBeTruthy();
  expect(router.push).toHaveBeenCalledWith('/(patient)/results');

  await fireEvent.press(screen.getByRole('button', { name: 'Pós-operatório' }));
  expect(screen.getByText('Pós-operatório|demo-service-physio|esclarecer')).toBeTruthy();
});
