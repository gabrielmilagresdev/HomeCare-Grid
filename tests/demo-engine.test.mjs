import assert from 'node:assert/strict';
import test from 'node:test';
import { DemoEngine } from '../src/services/demo/engine.ts';
import { interpretDemoConcierge } from '../src/services/demo/concierge.ts';
import { splitSimulatedAmount } from '../src/domain/rules/payments.ts';

const engine = () => new DemoEngine(new Date('2026-11-08T12:00:00Z'));
function requestFor(instance, id, window = instance.fixture.suggestedWindow) {
  return { id, recipientId: instance.fixture.recipient.id, requesterUserId: 'demo-contractor', serviceId: 'demo-service-support',
    regionCode: 'DEMO-CENTRO', startsAt: window.startsAt, endsAt: window.endsAt, requiredAccessibilityTags: [], maxPriceCents: null };
}

test('jornada: solicitação idempotente, aceite único, agenda e eventos', () => {
  const demo = engine();
  const first = demo.request('demo-contractor', requestFor(demo, 'demo-request-1'), 'demo-professional-a', 'demo-key-0001');
  assert.equal(first.ok, true);
  const retry = demo.request('demo-contractor', requestFor(demo, 'demo-request-1'), 'demo-professional-a', 'demo-key-0001');
  assert.deepEqual(retry, first);
  assert.equal(demo.listForRecipient('demo-contractor').data.length, 1);
  const second = demo.request('demo-contractor', requestFor(demo, 'demo-request-2'), 'demo-professional-a', 'demo-key-0002');
  assert.equal(second.ok, true);
  const accepted = demo.transition('demo-pro-a', first.data.id, 'accepted', 1);
  assert.equal(accepted.ok, true);
  assert.equal(accepted.data.version, 2);
  assert.equal(demo.transition('demo-pro-a', second.data.id, 'accepted', 1).error.code, 'conflict');
  assert.equal(demo.transition('demo-pro-a', first.data.id, 'rejected', 2).error.code, 'conflict');
  assert.equal(demo.transition('demo-pro-a', first.data.id, 'cancelled', 1).error.code, 'conflict');
  assert.equal(demo.getEvents('demo-contractor', first.data.id).data.length, 1);
  assert.equal(demo.listForRecipient('demo-family').data[0].status, 'accepted');
});

test('vínculo familiar distingue leitura, reserva e revogação imediata', () => {
  const demo = engine();
  const input = { ...requestFor(demo, 'demo-family-request'), requesterUserId: 'demo-family' };
  assert.equal(demo.request('demo-family', input, 'demo-professional-a', 'demo-family-key').error.code, 'unauthorized');
  assert.equal(demo.setFamilyPermission('demo-contractor', 'demo-family', 'canBook', true).ok, true);
  const booking = demo.request('demo-family', input, 'demo-professional-a', 'demo-family-key');
  assert.equal(booking.ok, true);
  assert.equal(demo.setFamilyPermission('demo-contractor', 'demo-family', 'revoke').ok, true);
  assert.equal(demo.listForRecipient('demo-family').error.code, 'unauthorized');
  assert.equal(demo.getRequest('demo-family', booking.data.id).error.code, 'unauthorized');
  assert.equal(demo.transition('demo-family', booking.data.id, 'cancelled', 1).error.code, 'unauthorized');
});

test('horários adjacentes podem ser aceitos pelo mesmo profissional', () => {
  const demo = engine();
  const a = demo.request('demo-contractor', requestFor(demo, 'demo-a'), 'demo-professional-a', 'demo-key-a');
  const b = demo.request('demo-contractor', requestFor(demo, 'demo-b', demo.fixture.alternateWindow), 'demo-professional-a', 'demo-key-b');
  assert.equal(demo.transition('demo-pro-a', a.data.id, 'accepted', 1).ok, true);
  assert.equal(demo.transition('demo-pro-a', b.data.id, 'accepted', 1).ok, true);
});

test('demanda exige consentimento, usa allowlist e suprime grupos pequenos', () => {
  const demo = engine();
  assert.equal(demo.recordUnservedDemand('demo-contractor', 'demo-service-support', 'DEMO-ZONA-NORTE', false).error.code, 'validation');
  assert.equal(demo.recordUnservedDemand('demo-contractor', 'demo-service-support', 'REGIAO-REAL', true).error.code, 'validation');
  assert.equal(demo.recordUnservedDemand('demo-contractor', 'demo-service-support', 'DEMO-ZONA-NORTE', true).ok, true);
  const groups = demo.listDemandAggregates('demo-pro-a');
  assert.equal(groups.ok, true);
  assert.deepEqual(groups.data.map(group => [group.serviceId, group.regionCode, group.count]), [['demo-service-support', 'DEMO-CENTRO', 6]]);
  assert.equal(demo.revokeDemandConsent('demo-contractor').ok, true);
});

test('concierge offline pede confirmação; divisão simulada preserva centavos', () => {
  const demo = engine();
  const complete = interpretDemoConcierge('Preciso de apoio no Centro amanhã de manhã', demo.fixture);
  assert.equal(complete.ok, true);
  assert.equal(complete.data.clarificationNeeded, false);
  const incomplete = interpretDemoConcierge('Preciso de ajuda', demo.fixture);
  assert.equal(incomplete.ok, true);
  assert.equal(incomplete.data.clarificationNeeded, true);
  const split = splitSimulatedAmount(10001, ['demo-a', 'demo-b', 'demo-c']);
  assert.equal(split.ok, true);
  assert.equal(split.data.reduce((total, share) => total + share.amountCents, 0), 10001);
  assert.deepEqual(split.data.map(share => share.amountCents), [3334, 3334, 3333]);
});
