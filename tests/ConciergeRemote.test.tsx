import { act, render } from '@testing-library/react-native';
import { useEffect } from 'react';
import { DemoProvider, useDemo } from '../src/features/demo/DemoContext';
import { interpretRemoteConcierge } from '../src/services/ai/concierge';

jest.mock('../src/services/ai/concierge', () => ({
  remoteConciergeConfigured: true,
  interpretRemoteConcierge: jest.fn()
}));

type ContextValue = ReturnType<typeof useDemo>;
function Capture({ onValue }: { onValue: (value: ContextValue) => void }) {
  const value = useDemo();
  useEffect(() => { onValue(value); }, [value, onValue]);
  return null;
}

test('aplica sugestão remota e preserva filtros editáveis', async () => {
  let context!: ContextValue;
  (interpretRemoteConcierge as jest.Mock).mockImplementation(async (_text, fixture) => ({ ok: true,
    data: { serviceId: 'demo-service-physio', regionCode: 'DEMO-CENTRO', window: fixture.suggestedWindow,
      frequency: null, accessibilityTags: [], clarificationNeeded: false, reply: 'Encontrei opções de fisioterapia no Centro.' } }));
  await render(<DemoProvider><Capture onValue={value => { context = value; }} /></DemoProvider>);
  await act(async () => { expect((await context.suggestIntent('Fisioterapia amanhã no Centro')).ok).toBe(true); });
  expect(context.search.serviceId).toBe('demo-service-physio');
  expect(context.conciergeNotice).toContain('TatinhIA');
  expect(context.conciergeReply).toContain('fisioterapia');
  await act(async () => { context.setSearch({ ...context.search, regionCode: 'DEMO-ZONA-OESTE' }); });
  expect(context.search.regionCode).toBe('DEMO-ZONA-OESTE');
});

test('falha remota recua para filtros locais sem inventar serviço', async () => {
  let context!: ContextValue;
  (interpretRemoteConcierge as jest.Mock).mockResolvedValue({ ok: false, error: { code: 'network', message: 'Indisponível.' } });
  await render(<DemoProvider><Capture onValue={value => { context = value; }} /></DemoProvider>);
  await act(async () => { expect((await context.suggestIntent('Pós-operatório')).ok).toBe(true); });
  expect(context.serviceChoiceRequired).toBe(true);
  expect(context.conciergeNotice).toContain('filtros básicos');
});
