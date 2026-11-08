import test from 'node:test';
import assert from 'node:assert/strict';
import {canTransition, overlaps} from '../src/domain/rules/bookings.ts';
import {canAccessRecipient} from '../src/domain/rules/authorization.ts';
import {rankProfessionals} from '../src/domain/rules/matching.ts';
import {isUtcInstant, parseCareRequest, parseConciergeFilters} from '../src/domain/schemas/index.ts';
import {demoRequest as request, demoService as service, demoProfessionals as pros} from '../src/testing/fixtures.ts';

test('UTC explícito, calendário real e milissegundos', () => {
  for (const value of ['2026-11-09T12:00:00Z','2026-11-09T12:00:00.123Z']) assert.equal(isUtcInstant(value),true);
  for (const value of ['2026-02-30T12:00:00Z','2026-11-09T12:00:00','2026-11-09T09:00:00-03:00','bad',null]) assert.equal(isUtcInstant(value),false);
});
test('solicitação válida descarta campos não permitidos', () => {
  const result=parseCareRequest({...request, diagnosis:'ignored'});
  assert.equal(result.ok,true); assert.equal('diagnosis' in result.data,false);
});
test('solicitação rejeita intervalo invertido, preço fracionário e campos ausentes', () => {
  for (const input of [{...request, endsAt:request.startsAt},{...request,maxPriceCents:1.5},{...request,regionCode:''},{...request,requiredAccessibilityTags:['']},{}]) assert.equal(parseCareRequest(input).ok,false);
});
test('Concierge valida catálogo e não transporta campos clínicos', () => {
  const input={serviceId:service.id,regionCode:request.regionCode,window:request,frequency:null,accessibilityTags:[],clarificationNeeded:false,diagnosis:'ignored'};
  const result=parseConciergeFilters(input,[service.id],[request.regionCode]);
  assert.equal(result.ok,true); assert.equal('diagnosis' in result.data,false);
  assert.deepEqual(Object.keys(result.data.window).sort(),['endsAt','startsAt']);
  assert.equal(parseConciergeFilters({...input,serviceId:'invented'},[service.id],[request.regionCode]).ok,false);
  assert.equal(parseConciergeFilters({},[service.id],[request.regionCode]).ok,false);
});
test('Concierge ambíguo exige esclarecimento', () => {
  const result=parseConciergeFilters({serviceId:null,regionCode:null,window:null,frequency:null,accessibilityTags:[],clarificationNeeded:false},[],[]);
  assert.equal(result.ok,true); assert.equal(result.data.clarificationNeeded,true);
});
const states=['requested','accepted','rejected','cancelled','completed'];
const allowed=new Set(['requested:accepted','requested:rejected','requested:cancelled','accepted:cancelled','accepted:completed']);
for (const from of states) test('transições a partir de '+from,()=>{for(const to of states) assert.equal(canTransition(from,to),allowed.has(from+':'+to));});
test('intervalos adjacentes não conflitam; sobreposição sim', () => {
  assert.equal(overlaps(request,{startsAt:request.endsAt,endsAt:'2026-11-09T14:00:00Z'}),false);
  assert.equal(overlaps(request,{startsAt:'2026-11-09T12:30:00Z',endsAt:'2026-11-09T13:30:00Z'}),true);
  assert.throws(()=>overlaps(request,{startsAt:'bad',endsAt:request.endsAt}));
});
test('matching elimina não elegíveis antes de ordenar', () => {
  const candidates=[...pros,{...pros[0],id:'bad-region',hourlyPriceCents:1,regionCodes:['OTHER']},{...pros[0],id:'bad-slot',availability:[]},{...pros[0],id:'bad-service',serviceIds:[]}];
  assert.deepEqual(rankProfessionals(request,service,candidates).map(p=>p.professionalId),[pros[0].id]);
});
test('credencial exigida falha fechada', () => {
  assert.equal(rankProfessionals(request,{...service,requiresCredential:true},pros).length,0);
  assert.equal(rankProfessionals(request,{...service,requiresCredential:true},[{...pros[0],credentialStatus:'verified'}]).length,1);
});
test('orçamento, acessibilidade, preço inválido e vazio', () => {
  assert.equal(rankProfessionals({...request,maxPriceCents:1},service,pros).length,0);
  assert.equal(rankProfessionals({...request,requiredAccessibilityTags:['wheelchair']},service,pros).length,0);
  assert.equal(rankProfessionals(request,service,[{...pros[0],hourlyPriceCents:NaN}]).length,0);
  assert.deepEqual(rankProfessionals(request,service,[]),[]);
});
test('ordenação determinística por preço e ID sem score clínico', () => {
  const candidates=[{...pros[0],id:'b'},{...pros[0],id:'a'},{...pros[0],id:'c',hourlyPriceCents:5000}];
  const result=rankProfessionals(request,service,candidates);
  assert.deepEqual(result.map(p=>p.professionalId),['c','a','b']);
  assert.equal('score' in result[0],false); assert.ok(result[0].reasons.length>0);
});
const recipient={id:'r',ownerUserId:'owner',displayName:'Fictício'};
const membership={id:'m',recipientId:'r',userId:'family',canBook:false,canViewSchedule:true,revokedAt:null};
test('owner acessa; terceiro não',()=>{assert.equal(canAccessRecipient('owner',recipient,[],'book'),true);assert.equal(canAccessRecipient('other',recipient,[membership],'viewSchedule'),false);});
test('familiar view-only não reserva e revogação remove acesso',()=>{
  assert.equal(canAccessRecipient('family',recipient,[membership],'viewSchedule'),true);
  assert.equal(canAccessRecipient('family',recipient,[membership],'book'),false);
  assert.equal(canAccessRecipient('family',recipient,[{...membership,revokedAt:'2026-11-07T00:00:00Z'}],'viewSchedule'),false);
  assert.equal(canAccessRecipient('family',{...recipient,id:'other'},[membership],'viewSchedule'),false);
});

test('catálogo demo retorna cópias isoladas de fixtures', async () => {
  const { demoCatalog } = await import('../src/services/demo/catalog.ts');
  const first = await demoCatalog.listProfessionals();
  assert.equal(first.ok, true);
  first.data[0].regionCodes.push('mutated');
  first.data[0].availability[0].startsAt = 'bad';
  const second = await demoCatalog.listProfessionals();
  assert.equal(second.data[0].regionCodes.includes('mutated'), false);
  assert.equal(isUtcInstant(second.data[0].availability[0].startsAt), true);
});
