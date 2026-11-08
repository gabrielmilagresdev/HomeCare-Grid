import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AudioModule } from 'expo-audio';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { DemoProvider, useDemo } from '../src/features/demo/DemoContext';
import { ConciergeHomeScreen } from '../src/features/marketplace/ConciergeHomeScreen';
import { transcribeVoice } from '../src/services/ai/voice';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));
const mockRecorder = { uri: 'file:///voice.m4a', prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
  record: jest.fn(), stop: jest.fn().mockResolvedValue(undefined) };
jest.mock('expo-audio', () => ({
  AudioModule: { requestRecordingPermissionsAsync: jest.fn() },
  RecordingPresets: { HIGH_QUALITY: {} },
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  useAudioRecorder: () => mockRecorder,
  useAudioRecorderState: () => ({ isRecording: false, durationMillis: 0 })
}));
jest.mock('expo-speech', () => ({ stop: jest.fn(), speak: jest.fn() }));
jest.mock('../src/services/ai/voice', () => ({ transcribeVoice: jest.fn() }));

function SearchState() {
  const { intent, search, serviceChoiceRequired } = useDemo();
  return <Text>{`${intent}|${search.serviceId}|${serviceChoiceRequired ? 'esclarecer' : 'definido'}`}</Text>;
}

test('TatinhIA responde antes da busca e não infere especialidade para pós-operatório', async () => {
  await render(<DemoProvider><ConciergeHomeScreen /><SearchState /></DemoProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Fisioterapia' }));
  expect(screen.getByText('Fisioterapia|demo-service-physio|definido')).toBeTruthy();
  expect(screen.getByText(/Entendi que você procura fisioterapia/u)).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Ouvir resposta da TatinhIA' }));
  expect(Speech.speak).toHaveBeenCalledWith(expect.stringContaining('fisioterapia'), { language: 'pt-BR', rate: 0.92 });
  await fireEvent.press(screen.getByRole('button', { name: 'Ver profissionais sugeridos' }));
  expect(router.push).toHaveBeenCalledWith('/(patient)/results');

  await fireEvent.press(screen.getByRole('button', { name: 'Pós-operatório' }));
  expect(screen.getByText('Pós-operatório|demo-service-physio|esclarecer')).toBeTruthy();
});

test('microfone grava, transcreve e mostra resposta revisável', async () => {
  (AudioModule.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (transcribeVoice as jest.Mock).mockResolvedValue({ ok: true, data: 'Fisioterapia amanhã no Centro' });
  await render(<DemoProvider><ConciergeHomeScreen /><SearchState /></DemoProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Gravar mensagem para TatinhIA' }));
  await waitFor(() => expect(mockRecorder.record).toHaveBeenCalled());
  await fireEvent.press(screen.getByRole('button', { name: 'Gravar mensagem para TatinhIA' }));
  await waitFor(() => expect(screen.getByText(/Entendi que você procura fisioterapia/u)).toBeTruthy());
  expect(transcribeVoice).toHaveBeenCalledWith('file:///voice.m4a');
  expect(screen.getByText('Fisioterapia amanhã no Centro|demo-service-physio|definido')).toBeTruthy();
});
