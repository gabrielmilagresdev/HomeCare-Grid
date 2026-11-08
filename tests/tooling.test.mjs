import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {suspicious} from '../scripts/check-secrets.mjs';
import {validateConfig} from '../scripts/check-codex-config.mjs';
import {validatePlan, issueBody} from '../scripts/backlog-lib.mjs';
const plan=JSON.parse(fs.readFileSync('docs/agile/backlog.json','utf8'));
test('backlog tem IDs únicos, responsáveis válidos, dependências existentes e DAG',()=>assert.equal(validatePlan(plan),true));
test('ciclo e dependência ausente bloqueiam plano',()=>{
  const cycle=structuredClone(plan);cycle.stories[0].dependsOn=[cycle.stories[0].id];assert.throws(()=>validatePlan(cycle));
  const missing=structuredClone(plan);missing.stories[0].dependsOn=['missing'];assert.throws(()=>validatePlan(missing));
});
test('Issue tem escopo, aceite, contratos, testes e tarefas identificáveis',()=>{
  for(const story of plan.stories){const body=issueBody(story,plan,{});for(const field of ['Contexto','Objetivo','Escopo','Fora de escopo','Dependências','Contratos envolvidos','Arquivos previstos','Critérios de aceite','Testes obrigatórios','Definition of Done'])assert.ok(body.includes(field));assert.ok(body.includes(story.id+'.T1'));}
});
test('scanner reconhece formatos de segredo sem imprimir valores',()=>{
  assert.equal(suspicious('gh'+'p_'+'x'.repeat(36)),true);
  assert.equal(suspicious('sk'+'-proj-'+'a'.repeat(24)),true);
  assert.equal(suspicious('EXPO_PUBLIC_DATA_MODE=demo'),false);
});
test('config restrito rejeita rede habilitada e chaves extras',()=>{
  const source=fs.readFileSync('.codex/config.toml','utf8');assert.equal(validateConfig(source),true);
  assert.throws(()=>validateConfig(source.replace('network_access = false','network_access = true')));
  assert.throws(()=>validateConfig(source+'\nunknown = true\n'));
});
