import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../src/components/ui/Button';
test('expõe ação acessível e respeita desabilitação', async () => {
  const onPress = jest.fn();
  const view = await render(<Button label="Solicitar apoio" onPress={onPress} />);
  fireEvent.press(screen.getByRole('button', { name: 'Solicitar apoio' }));
  expect(onPress).toHaveBeenCalledTimes(1);
  await view.rerender(<Button label="Solicitar apoio" onPress={onPress} disabled />);
  fireEvent.press(screen.getByRole('button', { name: 'Solicitar apoio' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
