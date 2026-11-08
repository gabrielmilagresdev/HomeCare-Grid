# Backlog HomeCare Grid

Fonte estruturada: backlog.json. Estado remoto/URLs: github-map.json. Stories só ficam Done após integração validada; nenhum recurso é inferido do planejamento.

31 Stories MVP (65 horas-agente estimadas), oito itens pós-MVP, dez Epics e um bootstrap. Tasks T1/T2 são checklists dentro de cada Story, sem Issues artificiais. Estimativas não são promessa de entrega; Lucas central concentra caminho crítico.

## [#1](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/1) — Foundation & Governance

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0.1 | [#13](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/13) Inicializar Expo e TypeScript | Lucas — Operacional | p0 | 0 | 1 | [#2](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/2) | blocked |
| 0.2 | [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14) Revisar arquitetura e contratos iniciais | Lucas — Operacional | p0 | 0 | 1 | [#2](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/2) | blocked |
| 0.3 | [#15](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/15) Validar qualidade e GitHub Actions | Gabriel — Operacional | p0 | 0 | 1 | [#2](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/2) | blocked |
| 0.4 | [#16](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/16) Auditar políticas e isolamento | Lucas — Operacional | p0 | 0 | 1 | [#2](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/2) | blocked |
| 0.5 | [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17) Ativar proteções e gate de merge | Lucas — Árbitro | p0 | 0 | 1 |  | blocked |

## [#3](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/3) — Design System & Navegação

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.1 | [#18](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/18) Tema e componentes básicos | Gabriel — Operacional | p0 | 1 | 2 | [#13](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/13), [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14), [#15](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/15), [#16](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/16), [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17) | blocked |
| 1.2 | [#20](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/20) Navegação e layouts por papel | Lucas — Operacional | p0 | 1 | 2 | [#13](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/13), [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14), [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17), [#19](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/19) | blocked |
| 1.3 | [#21](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/21) Estados visuais e acessibilidade | Julio — Operacional | p0 | 1 | 2 | [#13](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/13), [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14), [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17) | blocked |

## [#4](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/4) — Authentication & User Roles

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2.1 | [#22](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/22) Autenticação compatível com Expo Go | Matheus — Operacional | p0 | 1 | 3 | [#13](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/13), [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14), [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17) | blocked |
| 2.2 | [#19](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/19) Papéis e autorização por recurso | Lucas — Operacional | p0 | 1 | 2 | [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14), [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17) | blocked |
| 2.3 | [#23](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/23) Fixtures e ambiente demonstrativo | Matheus — Operacional | p0 | 1 | 2 | [#13](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/13), [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14), [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17) | blocked |

## [#5](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/5) — Marketplace & Discovery

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3.1 | [#24](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/24) Catálogo e perfis profissionais | Julio — Operacional | p0 | 1 | 2 | [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14), [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17) | blocked |
| 3.2 | [#26](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/26) Listagem, filtros e busca | Gabriel — Operacional | p0 | 2 | 3 | [#18](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/18), [#21](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/21), [#23](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/23), [#24](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/24), [#25](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/25) | blocked |
| 3.3 | [#27](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/27) AI Care Concierge com saída validada | Lucas — Operacional | p1 | 2 | 3 | [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14), [#19](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/19), [#24](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/24) | blocked |
| 3.4 | [#25](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/25) Smart Match determinístico e explicável | Lucas — Operacional | p0 | 1 | 2 | [#14](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/14), [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17) | blocked |

## [#6](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/6) — Bookings & Professional Workflow

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4.1 | [#28](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/28) Máquina de estados e backend de reservas | Lucas — Operacional | p0 | 2 | 4 | [#22](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/22), [#19](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/19), [#24](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/24) | blocked |
| 4.2 | [#29](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/29) Interface de solicitação da pessoa | Gabriel — Operacional | p0 | 2 | 3 | [#18](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/18), [#21](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/21), [#26](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/26), [#28](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/28) | blocked |
| 4.3 | [#30](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/30) Aceite e recusa profissional | Matheus — Operacional | p0 | 2 | 3 | [#21](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/21), [#22](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/22), [#28](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/28) | blocked |
| 4.4 | [#31](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/31) Concorrência e consistência de agenda | Lucas — Operacional | p0 | 2 | 2 | [#28](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/28) | blocked |

## [#7](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/7) — Family Hub & Continuity

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5.1 | [#32](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/32) Permissões e vínculos familiares | Lucas — Operacional | p0 | 2 | 3 | [#22](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/22), [#19](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/19), [#28](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/28) | blocked |
| 5.2 | [#33](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/33) Agenda compartilhada e acompanhamento | Julio — Operacional | p0 | 2 | 3 | [#21](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/21), [#28](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/28), [#32](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/32) | blocked |
| 5.3 | [#35](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/35) Continuidade básica de atendimento | Julio — Operacional | p2 | 3 | 2 | [#33](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/33), [#34](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/34) | blocked |

## [#8](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/8) — Grid Demand

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 6.1 | [#36](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/36) Registro de solicitação não atendida | Lucas — Operacional | p1 | 3 | 2 | [#25](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/25), [#32](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/32) | blocked |
| 6.2 | [#37](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/37) Interface sem cobertura | Matheus — Operacional | p1 | 3 | 2 | [#21](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/21), [#26](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/26), [#36](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/36) | blocked |
| 6.3 | [#38](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/38) Oportunidades agregadas sem exposição | Lucas — Operacional | p2 | 3 | 2 | [#36](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/36) | blocked |

## [#9](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/9) — FamilyPay Demonstrativo

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 7.1 | [#39](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/39) FamilyPay simulado e divisão familiar | Julio — Operacional | p2 | 3 | 2 | [#33](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/33), [#34](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/34) | blocked |

## [#10](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/10) — Quality, Integration & Demo

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 8.1 | [#40](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/40) Compatibilidade, bundle e Expo Go | Gabriel — Operacional | p0 | 3 | 2 | [#26](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/26), [#29](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/29), [#30](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/30), [#33](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/33) | blocked |
| 8.2 | [#34](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/34) Jornada principal integrada | Lucas — Operacional | p0 | 3 | 3 | [#29](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/29), [#30](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/30), [#31](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/31), [#33](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/33) | blocked |
| 8.3 | [#41](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/41) Documentação e roteiro demonstrativo | Matheus — Operacional | p0 | 3 | 1 | [#40](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/40), [#34](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/34) | blocked |
| 8.4 | [#42](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/42) Auditar PRs e autorizar integrações | Lucas — Árbitro | p0 | 3 | 2 | [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17), [#40](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/40), [#34](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/34) | blocked |
| 8.5 | [#43](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/43) Release candidata e integração final | Lucas — Árbitro | p0 | 3 | 1 | [#41](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/41), [#42](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/42) | blocked |

## [#11](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/11) — Post-MVP

| ID | Story | Responsável | P | Wave | h | Depende de | Estado inicial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F.1 | [#44](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/44) Grid Routes avançado | Lucas — Operacional | p2 | 4 | futuro | [#43](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/43) | backlog |
| F.2 | [#45](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/45) Care Passport completo | Julio — Operacional | p2 | 4 | futuro | [#43](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/43) | backlog |
| F.3 | [#46](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/46) Integração de pagamentos reais | Matheus — Operacional | p2 | 4 | futuro | [#43](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/43) | backlog |
| F.4 | [#47](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/47) Verificação automatizada de registros profissionais | Lucas — Operacional | p2 | 4 | futuro | [#43](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/43) | backlog |
| F.5 | [#48](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/48) Integração WhatsApp | Matheus — Operacional | p2 | 4 | futuro | [#43](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/43) | backlog |
| F.6 | [#49](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/49) Notificações reais | Gabriel — Operacional | p2 | 4 | futuro | [#43](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/43) | backlog |
| F.7 | [#50](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/50) Recorrência avançada | Julio — Operacional | p2 | 4 | futuro | [#43](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/43) | backlog |
| F.8 | [#51](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/51) Integração geográfica real | Lucas — Operacional | p2 | 4 | futuro | [#43](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/43) | backlog |

## Escopo detalhado


### 0.1 — Inicializar Expo e TypeScript

<!-- hcg:0.1 -->
Epic: #1

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 0 | Estimativa: 1h
Status: blocked

## Contexto
Hackathon de 36h; Epic Foundation & Governance.

## Objetivo
Inicializar Expo e TypeScript

## Escopo
Abrir scaffold mobile sem módulos nativos customizados; preservar configuração única

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #2

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Expo SDK 58, Router, strict
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- app/**
- package.json
- package-lock.json
- app.json
- tsconfig.json

## Critérios de aceite
- [ ] npm ci e bundle Android/iOS aprovados
- [ ] modo demo sem credenciais

## Tasks / subtasks
- [ ] 0.1.T1 — Implementar: Abrir scaffold mobile sem módulos nativos customizados; preservar configuração única (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 0.1.T2 — Verificar: typecheck; expo install --check; doctor; bundle. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- typecheck
- expo install --check
- doctor
- bundle

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 0.2 — Revisar arquitetura e contratos iniciais

<!-- hcg:0.2 -->
Epic: #1

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 0 | Estimativa: 1h
Status: blocked

## Contexto
Hackathon de 36h; Epic Foundation & Governance.

## Objetivo
Revisar arquitetura e contratos iniciais

## Escopo
Estabilizar IDs, UTC, centavos, estados e ports antes de consumidores

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #2

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Contrato v1 e Result/RemoteState
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/domain/**
- src/services/contracts.ts
- docs/architecture/**

## Critérios de aceite
- [ ] Uma fonte de tipos
- [ ] parsers rejeitam entradas inválidas
- [ ] consumidores identificados

## Tasks / subtasks
- [ ] 0.2.T1 — Implementar: Estabilizar IDs, UTC, centavos, estados e ports antes de consumidores (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 0.2.T2 — Verificar: npm test; typecheck; revisão arquitetural. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- npm test
- typecheck
- revisão arquitetural

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 0.3 — Validar qualidade e GitHub Actions

<!-- hcg:0.3 -->
Epic: #1

Responsável lógico: Gabriel — Operacional
Tipo: Story | Prioridade: P0 | Wave: 0 | Estimativa: 1h
Status: blocked

## Contexto
Hackathon de 36h; Epic Foundation & Governance.

## Objetivo
Validar qualidade e GitHub Actions

## Escopo
Conferir instalação reproduzível, lint, tipos, testes e bundle na CI

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #2

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Checks quality/pr-policy
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- .github/workflows/ci.yml
- tests/**
- scripts/check-*.mjs

## Critérios de aceite
- [ ] CI real no SHA atual
- [ ] falha de teste bloqueia check
- [ ] sem segredos no runner

## Tasks / subtasks
- [ ] 0.3.T1 — Implementar: Conferir instalação reproduzível, lint, tipos, testes e bundle na CI (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 0.3.T2 — Verificar: npm ci; lint; typecheck; npm test; test:ui; doctor; bundle. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- npm ci
- lint
- typecheck
- npm test
- test:ui
- doctor
- bundle

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 0.4 — Auditar políticas e isolamento

<!-- hcg:0.4 -->
Epic: #1

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 0 | Estimativa: 1h
Status: blocked

## Contexto
Hackathon de 36h; Epic Foundation & Governance.

## Objetivo
Auditar políticas e isolamento

## Escopo
Conferir prompts concisos, limites e isolamento real; auditoria por Lucas Árbitro

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #2

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Políticas e ownership
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- AGENTS.md
- .agents/**
- .codex/config.toml
- docs/operations/**

## Critérios de aceite
- [ ] Cinco ambientes/credenciais especificados
- [ ] limitações separadas do provisionado

## Tasks / subtasks
- [ ] 0.4.T1 — Implementar: Conferir prompts concisos, limites e isolamento real; auditoria por Lucas Árbitro (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 0.4.T2 — Verificar: validar config; checklist de mounts e credenciais; revisão independente. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- validar config
- checklist de mounts e credenciais
- revisão independente

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 0.5 — Ativar proteções e gate de merge

<!-- hcg:0.5 -->
Epic: #1

Responsável lógico: Lucas — Árbitro
Tipo: Story | Prioridade: P0 | Wave: 0 | Estimativa: 1h
Status: blocked

## Contexto
Hackathon de 36h; Epic Foundation & Governance.

## Objetivo
Ativar proteções e gate de merge

## Escopo
Administrador habilita proteções; árbitro valida revisão independente e merge exclusivo

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
Nenhuma de código. Bloqueada por API administrativa, credenciais/identidades independentes e enforcement de merge.

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
API/rulesets e identidades independentes
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- docs/operations/**
- .github/CODEOWNERS

## Critérios de aceite
- [ ] GET comprova main/develop protegidas
- [ ] operador não integra
- [ ] autor não autoaprova
- [ ] administradores sujeitos aos gates

## Tasks / subtasks
- [ ] 0.5.T1 — Implementar: Administrador habilita proteções; árbitro valida revisão independente e merge exclusivo (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 0.5.T2 — Verificar: tentativa negada de merge operacional; checks falhando impedem merge; mudança invalida aprovação. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- tentativa negada de merge operacional
- checks falhando impedem merge
- mudança invalida aprovação

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 1.1 — Tema e componentes básicos

<!-- hcg:1.1 -->
Epic: #3

Responsável lógico: Gabriel — Operacional
Tipo: Story | Prioridade: P0 | Wave: 1 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Design System & Navegação.

## Objetivo
Tema e componentes básicos

## Escopo
Expandir tokens e Button/Input/Card reutilizáveis sem editar layout global

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #13
- Blocked by #14
- Blocked by #15
- Blocked by #16
- Blocked by #17

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Theme e props UI
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/theme/**
- src/components/ui/**

## Critérios de aceite
- [ ] Identidade visual aplicada
- [ ] alvos >=48
- [ ] labels
- [ ] estados disabled/loading/error

## Tasks / subtasks
- [ ] 1.1.T1 — Implementar: Expandir tokens e Button/Input/Card reutilizáveis sem editar layout global (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 1.1.T2 — Verificar: test:ui de interação e acessibilidade; typecheck. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- test:ui de interação e acessibilidade
- typecheck

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 1.2 — Navegação e layouts por papel

<!-- hcg:1.2 -->
Epic: #3

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 1 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Design System & Navegação.

## Objetivo
Navegação e layouts por papel

## Escopo
Compor layouts e retorno por capacidade sem usar seletor visual como autorização

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #13
- Blocked by #14
- Blocked by #17
- Blocked by #19

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
UserRole e sessão
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- app/**
- src/features/auth/navigation/**

## Critérios de aceite
- [ ] Rotas sem permissão bloqueadas
- [ ] multirrole funciona
- [ ] sessão ausente não quebra

## Tasks / subtasks
- [ ] 1.2.T1 — Implementar: Compor layouts e retorno por capacidade sem usar seletor visual como autorização (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 1.2.T2 — Verificar: testes navegação/sessão; bundle; smoke Expo Go. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- testes navegação/sessão
- bundle
- smoke Expo Go

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 1.3 — Estados visuais e acessibilidade

<!-- hcg:1.3 -->
Epic: #3

Responsável lógico: Julio — Operacional
Tipo: Story | Prioridade: P0 | Wave: 1 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Design System & Navegação.

## Objetivo
Estados visuais e acessibilidade

## Escopo
Criar loading, empty, error e recuperação para telas consumidoras

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #13
- Blocked by #14
- Blocked by #17

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
RemoteState
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/components/common/**

## Critérios de aceite
- [ ] Textos legíveis, leitor de tela, erro claro e ação de tentar novamente

## Tasks / subtasks
- [ ] 1.3.T1 — Implementar: Criar loading, empty, error e recuperação para telas consumidoras (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 1.3.T2 — Verificar: test:ui por estado; fonte ampliada/contraste manual. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- test:ui por estado
- fonte ampliada/contraste manual

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 2.1 — Autenticação compatível com Expo Go

<!-- hcg:2.1 -->
Epic: #4

Responsável lógico: Matheus — Operacional
Tipo: Story | Prioridade: P0 | Wave: 1 | Estimativa: 3h
Status: blocked

## Contexto
Hackathon de 36h; Epic Authentication & User Roles.

## Objetivo
Autenticação compatível com Expo Go

## Escopo
Integrar Supabase Auth se credenciais disponíveis; preservar demo separada

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #13
- Blocked by #14
- Blocked by #17

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
User, Result e JWT
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/auth/**
- src/lib/supabase.ts
- supabase/migrations/auth/**

## Critérios de aceite
- [ ] Sessão restaurada/encerrada
- [ ] JWT verificado no servidor
- [ ] erro de rede recuperável
- [ ] sem service_role no cliente

## Tasks / subtasks
- [ ] 2.1.T1 — Implementar: Integrar Supabase Auth se credenciais disponíveis; preservar demo separada (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 2.1.T2 — Verificar: testes login/logout/expiração; anon/RLS; Expo Go; scanner. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- testes login/logout/expiração
- anon/RLS
- Expo Go
- scanner

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 2.2 — Papéis e autorização por recurso

<!-- hcg:2.2 -->
Epic: #4

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 1 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Authentication & User Roles.

## Objetivo
Papéis e autorização por recurso

## Escopo
Definir capacidades acumuláveis e negar acesso fora de vínculo explícito

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #14
- Blocked by #17

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
UserRole, CareRecipient, FamilyMembership
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/domain/rules/authorization.ts
- src/features/auth/authorization/**

## Critérios de aceite
- [ ] Owner e vínculos por ação
- [ ] revogado/terceiro negados
- [ ] não inferir autorização da UI

## Tasks / subtasks
- [ ] 2.2.T1 — Implementar: Definir capacidades acumuláveis e negar acesso fora de vínculo explícito (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 2.2.T2 — Verificar: matriz owner/view-only/book-only/revogado/terceiro. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- matriz owner/view-only/book-only/revogado/terceiro

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 2.3 — Fixtures e ambiente demonstrativo

<!-- hcg:2.3 -->
Epic: #4

Responsável lógico: Matheus — Operacional
Tipo: Story | Prioridade: P0 | Wave: 1 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Authentication & User Roles.

## Objetivo
Fixtures e ambiente demonstrativo

## Escopo
Dados sintéticos reproduzíveis e adapters sem chamada remota

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #13
- Blocked by #14
- Blocked by #17

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
CatalogService/BookingService
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/testing/**
- src/services/demo/**

## Critérios de aceite
- [ ] Modo demo explícito
- [ ] datas relativas/controladas
- [ ] cenários positivo/vazio/erro
- [ ] nenhum dado real

## Tasks / subtasks
- [ ] 2.3.T1 — Implementar: Dados sintéticos reproduzíveis e adapters sem chamada remota (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 2.3.T2 — Verificar: validação fixtures; isolamento de mutações; cenário sem credenciais. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- validação fixtures
- isolamento de mutações
- cenário sem credenciais

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 3.1 — Catálogo e perfis profissionais

<!-- hcg:3.1 -->
Epic: #5

Responsável lógico: Julio — Operacional
Tipo: Story | Prioridade: P0 | Wave: 1 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Marketplace & Discovery.

## Objetivo
Catálogo e perfis profissionais

## Escopo
Modelar projeção pública e tela de perfil; credencial nunca autodeclarada

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #14
- Blocked by #17

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Service, Professional, CatalogService
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/professionals/**
- src/features/marketplace/catalog/**

## Critérios de aceite
- [ ] Preço/região/serviço/horário claros
- [ ] loading/empty/error
- [ ] sem dados privados

## Tasks / subtasks
- [ ] 3.1.T1 — Implementar: Modelar projeção pública e tela de perfil; credencial nunca autodeclarada (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 3.1.T2 — Verificar: parser catálogo; test:ui perfil; credencial não verificada explícita. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- parser catálogo
- test:ui perfil
- credencial não verificada explícita

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 3.2 — Listagem, filtros e busca

<!-- hcg:3.2 -->
Epic: #5

Responsável lógico: Gabriel — Operacional
Tipo: Story | Prioridade: P0 | Wave: 2 | Estimativa: 3h
Status: blocked

## Contexto
Hackathon de 36h; Epic Marketplace & Discovery.

## Objetivo
Listagem, filtros e busca

## Escopo
Busca administrativa com filtros e explicações por elegibilidade

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #18
- Blocked by #21
- Blocked by #23
- Blocked by #24
- Blocked by #25

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
CareRequest, Match, CatalogService
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/marketplace/search/**

## Critérios de aceite
- [ ] Filtro exige região/serviço/horário
- [ ] nenhum elegível mostra recuperação
- [ ] score não representa qualidade clínica

## Tasks / subtasks
- [ ] 3.2.T1 — Implementar: Busca administrativa com filtros e explicações por elegibilidade (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 3.2.T2 — Verificar: test:ui filtros/resultados/vazio/erro; integração com ranking. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- test:ui filtros/resultados/vazio/erro
- integração com ranking

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 3.3 — AI Care Concierge com saída validada

<!-- hcg:3.3 -->
Epic: #5

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P1 | Wave: 2 | Estimativa: 3h
Status: blocked

## Contexto
Hackathon de 36h; Epic Marketplace & Discovery.

## Objetivo
AI Care Concierge com saída validada

## Escopo
Interpretar linguagem em filtros administrativos via ambiente protegido; fallback determinístico demo

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #14
- Blocked by #19
- Blocked by #24

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
ConciergeService/ConciergeFilters
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/concierge/**
- supabase/functions/concierge/**

## Critérios de aceite
- [ ] Allowlist validada
- [ ] ambíguo pede confirmação
- [ ] timeout/invalid/rede tratados
- [ ] nenhuma decisão clínica ou chave no bundle

## Tasks / subtasks
- [ ] 3.3.T1 — Implementar: Interpretar linguagem em filtros administrativos via ambiente protegido; fallback determinístico demo (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 3.3.T2 — Verificar: payload clínico extra descartado; timeout; catálogo ausente; saída incompleta/inválida; scanner. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- payload clínico extra descartado
- timeout
- catálogo ausente
- saída incompleta/inválida
- scanner

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 3.4 — Smart Match determinístico e explicável

<!-- hcg:3.4 -->
Epic: #5

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 1 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Marketplace & Discovery.

## Objetivo
Smart Match determinístico e explicável

## Escopo
Revisar/expandir regra base com hard filters antes da ordenação e explicação

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #14
- Blocked by #17

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
CareRequest, Professional, Match
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/matching/**
- src/domain/rules/matching.ts

## Critérios de aceite
- [ ] Serviço/região/credencial/horário/acessibilidade/orçamento obrigatórios
- [ ] ordem estável preço+ID
- [ ] sem LLM

## Tasks / subtasks
- [ ] 3.4.T1 — Implementar: Revisar/expandir regra base com hard filters antes da ordenação e explicação (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 3.4.T2 — Verificar: testes cada filtro, empate, vazio e imutabilidade. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- testes cada filtro, empate, vazio e imutabilidade

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 4.1 — Máquina de estados e backend de reservas

<!-- hcg:4.1 -->
Epic: #6

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 2 | Estimativa: 4h
Status: blocked

## Contexto
Hackathon de 36h; Epic Bookings & Professional Workflow.

## Objetivo
Máquina de estados e backend de reservas

## Escopo
Implementar RPC/transação autorizada, versionamento, idempotência e constraint de sobreposição

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #22
- Blocked by #19
- Blocked by #24

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Booking, BookingEvent, BookingService
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/bookings/core/**
- src/services/remote/bookings.ts
- supabase/migrations/bookings/**
- supabase/functions/bookings/**

## Critérios de aceite
- [ ] Transições válidas
- [ ] evento atômico
- [ ] profissional só aceita alvo
- [ ] completed após fim
- [ ] SQL conflict traduzido

## Tasks / subtasks
- [ ] 4.1.T1 — Implementar: Implementar RPC/transação autorizada, versionamento, idempotência e constraint de sobreposição (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 4.1.T2 — Verificar: máquina estados; RLS por papel; retry idempotente; rollback em erro. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- máquina estados
- RLS por papel
- retry idempotente
- rollback em erro

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 4.2 — Interface de solicitação da pessoa

<!-- hcg:4.2 -->
Epic: #6

Responsável lógico: Gabriel — Operacional
Tipo: Story | Prioridade: P0 | Wave: 2 | Estimativa: 3h
Status: blocked

## Contexto
Hackathon de 36h; Epic Bookings & Professional Workflow.

## Objetivo
Interface de solicitação da pessoa

## Escopo
Selecionar pessoa autorizada, profissional e horário; enviar solicitação

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #18
- Blocked by #21
- Blocked by #26
- Blocked by #28

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
BookingService/CareRequest
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/bookings/request/**

## Critérios de aceite
- [ ] Confirmar parâmetros
- [ ] dupla submissão idempotente
- [ ] conflito/erro recuperável
- [ ] estados explícitos

## Tasks / subtasks
- [ ] 4.2.T1 — Implementar: Selecionar pessoa autorizada, profissional e horário; enviar solicitação (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 4.2.T2 — Verificar: test:ui autorização, sucesso, conflito, timeout; integração ports. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- test:ui autorização, sucesso, conflito, timeout
- integração ports

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 4.3 — Aceite e recusa profissional

<!-- hcg:4.3 -->
Epic: #6

Responsável lógico: Matheus — Operacional
Tipo: Story | Prioridade: P0 | Wave: 2 | Estimativa: 3h
Status: blocked

## Contexto
Hackathon de 36h; Epic Bookings & Professional Workflow.

## Objetivo
Aceite e recusa profissional

## Escopo
Exibir solicitações próprias e aceitar/recusar com versão esperada

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #21
- Blocked by #22
- Blocked by #28

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
BookingService/BookingStatus
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/professionals/workflow/**

## Critérios de aceite
- [ ] Nenhuma dupla reserva
- [ ] stale version atualiza tela
- [ ] profissional alheio negado

## Tasks / subtasks
- [ ] 4.3.T1 — Implementar: Exibir solicitações próprias e aceitar/recusar com versão esperada (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 4.3.T2 — Verificar: test:ui aceite/recusa/conflito; autorização alvo. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- test:ui aceite/recusa/conflito
- autorização alvo

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 4.4 — Concorrência e consistência de agenda

<!-- hcg:4.4 -->
Epic: #6

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 2 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Bookings & Professional Workflow.

## Objetivo
Concorrência e consistência de agenda

## Escopo
Executar duas conexões reais e testar limites de intervalo

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #28

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
RPC e exclusion constraint
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- supabase/tests/**
- tests/integration/bookings/**

## Critérios de aceite
- [ ] Exatamente um aceite no mesmo horário
- [ ] adjacentes aceitos
- [ ] evento/status/versão consistentes
- [ ] sem depender de UI

## Tasks / subtasks
- [ ] 4.4.T1 — Implementar: Executar duas conexões reais e testar limites de intervalo (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 4.4.T2 — Verificar: PostgreSQL concorrente, rollback, idempotência, RLS; registrar evidência real. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- PostgreSQL concorrente, rollback, idempotência, RLS
- registrar evidência real

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 5.1 — Permissões e vínculos familiares

<!-- hcg:5.1 -->
Epic: #7

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 2 | Estimativa: 3h
Status: blocked

## Contexto
Hackathon de 36h; Epic Family Hub & Continuity.

## Objetivo
Permissões e vínculos familiares

## Escopo
Owner concede/revoga capacidades por recurso com RLS

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #22
- Blocked by #19
- Blocked by #28

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
FamilyMembership/CareRecipient
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/family/authorization/**
- supabase/migrations/family/**

## Critérios de aceite
- [ ] View-only não reserva
- [ ] revogação bloqueia próximas leituras
- [ ] sem acesso clínico irrestrito

## Tasks / subtasks
- [ ] 5.1.T1 — Implementar: Owner concede/revoga capacidades por recurso com RLS (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 5.1.T2 — Verificar: RLS owner/membro/revogado/terceiro; grants e mass assignment. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- RLS owner/membro/revogado/terceiro
- grants e mass assignment

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 5.2 — Agenda compartilhada e acompanhamento

<!-- hcg:5.2 -->
Epic: #7

Responsável lógico: Julio — Operacional
Tipo: Story | Prioridade: P0 | Wave: 2 | Estimativa: 3h
Status: blocked

## Contexto
Hackathon de 36h; Epic Family Hub & Continuity.

## Objetivo
Agenda compartilhada e acompanhamento

## Escopo
Agenda familiar respeitando vínculos ativos e fuso

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #21
- Blocked by #28
- Blocked by #32

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
BookingService/FamilyMembership
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/family/schedule/**

## Critérios de aceite
- [ ] Somente agendamentos permitidos
- [ ] revogado perde acesso
- [ ] empty/error acessíveis

## Tasks / subtasks
- [ ] 5.2.T1 — Implementar: Agenda familiar respeitando vínculos ativos e fuso (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 5.2.T2 — Verificar: test:ui e integração permissão; UTC->America/Sao_Paulo. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- test:ui e integração permissão
- UTC->America/Sao_Paulo

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 5.3 — Continuidade básica de atendimento

<!-- hcg:5.3 -->
Epic: #7

Responsável lógico: Julio — Operacional
Tipo: Story | Prioridade: P2 | Wave: 3 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Family Hub & Continuity.

## Objetivo
Continuidade básica de atendimento

## Escopo
Reutilizar seleção administrativa para nova solicitação, sem recorrência automática

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #33
- Blocked by #34

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
CareRequest/BookingService
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/family/continuity/**

## Critérios de aceite
- [ ] Nova reserva revalida autorização/disponibilidade
- [ ] sem copiar dados clínicos

## Tasks / subtasks
- [ ] 5.3.T1 — Implementar: Reutilizar seleção administrativa para nova solicitação, sem recorrência automática (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 5.3.T2 — Verificar: novo pedido conflita corretamente; vínculo revogado negado. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- novo pedido conflita corretamente
- vínculo revogado negado

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 6.1 — Registro de solicitação não atendida

<!-- hcg:6.1 -->
Epic: #8

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P1 | Wave: 3 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Grid Demand.

## Objetivo
Registro de solicitação não atendida

## Escopo
Persistir mínimos administrativos só com consentimento explícito válido

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #25
- Blocked by #32

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
UnservedDemand/ConsentRecord
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/demand/core/**
- supabase/migrations/demand/**

## Critérios de aceite
- [ ] Sem consentimento nada gravado
- [ ] revogação respeitada
- [ ] sem endereço/texto clínico

## Tasks / subtasks
- [ ] 6.1.T1 — Implementar: Persistir mínimos administrativos só com consentimento explícito válido (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 6.1.T2 — Verificar: RLS autor/terceiro; consentimento negado/revogado; minimização. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- RLS autor/terceiro
- consentimento negado/revogado
- minimização

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 6.2 — Interface sem cobertura

<!-- hcg:6.2 -->
Epic: #8

Responsável lógico: Matheus — Operacional
Tipo: Story | Prioridade: P1 | Wave: 3 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Grid Demand.

## Objetivo
Interface sem cobertura

## Escopo
Mostrar ausência de elegíveis e opção voluntária de registrar demanda

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #21
- Blocked by #26
- Blocked by #36

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
UnservedDemand/ConsentRecord
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/demand/ui/**

## Critérios de aceite
- [ ] Opt-in sem preseleção
- [ ] recusar continua fluxo
- [ ] sucesso/erro compreensíveis

## Tasks / subtasks
- [ ] 6.2.T1 — Implementar: Mostrar ausência de elegíveis e opção voluntária de registrar demanda (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 6.2.T2 — Verificar: test:ui consentimento, recusa, erro e retry. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- test:ui consentimento, recusa, erro e retry

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 6.3 — Oportunidades agregadas sem exposição

<!-- hcg:6.3 -->
Epic: #8

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P2 | Wave: 3 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Grid Demand.

## Objetivo
Oportunidades agregadas sem exposição

## Escopo
Demonstrar agregados sintéticos e supressão de grupos pequenos

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #36

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Projeção agregada por serviço/região
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/demand/aggregate/**
- supabase/functions/demand-aggregate/**

## Critérios de aceite
- [ ] Grupos <5 ocultos
- [ ] sem IDs/endereço
- [ ] acesso autorizado

## Tasks / subtasks
- [ ] 6.3.T1 — Implementar: Demonstrar agregados sintéticos e supressão de grupos pequenos (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 6.3.T2 — Verificar: teste supressão, reidentificação por filtros e autorização. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- teste supressão, reidentificação por filtros e autorização

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 7.1 — FamilyPay simulado e divisão familiar

<!-- hcg:7.1 -->
Epic: #9

Responsável lógico: Julio — Operacional
Tipo: Story | Prioridade: P2 | Wave: 3 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic FamilyPay Demonstrativo.

## Objetivo
FamilyPay simulado e divisão familiar

## Escopo
Organizar centavos e divisão sem provedor financeiro ou cartão

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #33
- Blocked by #34

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
SimulatedPayment
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- src/features/payments/**

## Critérios de aceite
- [ ] SIMULADO visível
- [ ] soma exata
- [ ] sem cobranças/transações reais
- [ ] não bloquear MVP

## Tasks / subtasks
- [ ] 7.1.T1 — Implementar: Organizar centavos e divisão sem provedor financeiro ou cartão (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 7.1.T2 — Verificar: arredondamento/centavos; test:ui rótulos; nenhuma chamada financeira. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- arredondamento/centavos
- test:ui rótulos
- nenhuma chamada financeira

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 8.1 — Compatibilidade, bundle e Expo Go

<!-- hcg:8.1 -->
Epic: #10

Responsável lógico: Gabriel — Operacional
Tipo: Story | Prioridade: P0 | Wave: 3 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Quality, Integration & Demo.

## Objetivo
Compatibilidade, bundle e Expo Go

## Escopo
Executar doctor/bundle e smoke em Expo Go compatível

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #26
- Blocked by #29
- Blocked by #30
- Blocked by #33

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
SDK selecionado e navegação
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- docs/demo/mobile-smoke.md
- app.json

## Critérios de aceite
- [ ] Registrar aparelho/SO/SDK/SHA
- [ ] navegação/fonte/leitor
- [ ] limitações explícitas

## Tasks / subtasks
- [ ] 8.1.T1 — Implementar: Executar doctor/bundle e smoke em Expo Go compatível (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 8.1.T2 — Verificar: doctor; install --check; export Android/iOS; smoke físico real. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- doctor
- install --check
- export Android/iOS
- smoke físico real

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 8.2 — Jornada principal integrada

<!-- hcg:8.2 -->
Epic: #10

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P0 | Wave: 3 | Estimativa: 3h
Status: blocked

## Contexto
Hackathon de 36h; Epic Quality, Integration & Demo.

## Objetivo
Jornada principal integrada

## Escopo
Solicitar -> matching -> escolha -> aceite -> confirmação -> família

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #29
- Blocked by #30
- Blocked by #31
- Blocked by #33

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Ports, reserva e família
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- tests/integration/journey/**
- docs/demo/**

## Critérios de aceite
- [ ] Jornada positiva e erro/confllito/revogação
- [ ] sem regressão
- [ ] fixture sintética

## Tasks / subtasks
- [ ] 8.2.T1 — Implementar: Solicitar -> matching -> escolha -> aceite -> confirmação -> família (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 8.2.T2 — Verificar: integração jornada com banco se remoto; test:ui; evidências SHA. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- integração jornada com banco se remoto
- test:ui
- evidências SHA

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 8.3 — Documentação e roteiro demonstrativo

<!-- hcg:8.3 -->
Epic: #10

Responsável lógico: Matheus — Operacional
Tipo: Story | Prioridade: P0 | Wave: 3 | Estimativa: 1h
Status: blocked

## Contexto
Hackathon de 36h; Epic Quality, Integration & Demo.

## Objetivo
Documentação e roteiro demonstrativo

## Escopo
Revisar setup e roteiro curto com contingência offline

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #40
- Blocked by #34

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Funcionalidades efetivamente integradas
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- README.md
- docs/demo/**

## Critérios de aceite
- [ ] Nenhuma promessa de recurso futuro
- [ ] passos reproduzíveis e simulação explícita

## Tasks / subtasks
- [ ] 8.3.T1 — Implementar: Revisar setup e roteiro curto com contingência offline (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 8.3.T2 — Verificar: executar roteiro limpo; conferir links/limitações. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- executar roteiro limpo
- conferir links/limitações

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 8.4 — Auditar PRs e autorizar integrações

<!-- hcg:8.4 -->
Epic: #10

Responsável lógico: Lucas — Árbitro
Tipo: Story | Prioridade: P0 | Wave: 3 | Estimativa: 2h
Status: blocked

## Contexto
Hackathon de 36h; Epic Quality, Integration & Demo.

## Objetivo
Auditar PRs e autorizar integrações

## Escopo
Revisar PRs reais por identidade independente, incluindo Lucas Operacional

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #17
- Blocked by #40
- Blocked by #34

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Critérios de aceite e SHA revisado
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- docs/audit/reviews/**

## Critérios de aceite
- [ ] Diff completo, checks atuais, sem autoaprovação/bypass
- [ ] resultado documentado

## Tasks / subtasks
- [ ] 8.4.T1 — Implementar: Revisar PRs reais por identidade independente, incluindo Lucas Operacional (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 8.4.T2 — Verificar: verificar testes/CI, segurança e dependências; nova revisão após commit. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- verificar testes/CI, segurança e dependências
- nova revisão após commit

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### 8.5 — Release candidata e integração final

<!-- hcg:8.5 -->
Epic: #10

Responsável lógico: Lucas — Árbitro
Tipo: Story | Prioridade: P0 | Wave: 3 | Estimativa: 1h
Status: blocked

## Contexto
Hackathon de 36h; Epic Quality, Integration & Demo.

## Objetivo
Release candidata e integração final

## Escopo
Abrir/revisar PR de release e integrar somente se elegível

## Fora de escopo
Funcionalidades fora desta Story, dados reais, pagamentos reais, diagnóstico e alterações centrais sem coordenação.

## Dependências
- Blocked by #41
- Blocked by #42

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
develop -> main
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- docs/demo/release-notes.md

## Critérios de aceite
- [ ] CI e revisão independentes
- [ ] main estável
- [ ] release descreve limites reais

## Tasks / subtasks
- [ ] 8.5.T1 — Implementar: Abrir/revisar PR de release e integrar somente se elegível (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] 8.5.T2 — Verificar: npm ci; checks completos; smoke jornada; validar main após merge. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- npm ci
- checks completos
- smoke jornada
- validar main após merge

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### F.1 — Grid Routes avançado

<!-- hcg:F.1 -->
Epic: #11

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P2 | Wave: 4 | Estimativa: a estimar após MVP
Status: backlog

## Contexto
Hackathon de 36h; Epic Post-MVP.

## Objetivo
Grid Routes avançado

## Escopo
Pesquisar viabilidade e requisitos de grid routes avançado após o hackathon.

## Fora de escopo
Implementação durante as 36 horas; não comprometer MVP.

## Dependências
- Blocked by #43

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Contrato futuro exige ADR e revisão
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- a definir após ADR pós-MVP

## Critérios de aceite
- [ ] ADR e escopo aprovados após MVP
- [ ] Requisitos técnicos/legais e riscos verificados antes de implementar

## Tasks / subtasks
- [ ] F.1.T1 — Implementar: Pesquisar viabilidade e requisitos de grid routes avançado após o hackathon. (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] F.1.T2 — Verificar: Plano de testes e compatibilidade Expo Go definidos antes de instalar. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- Plano de testes e compatibilidade Expo Go definidos antes de instalar

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### F.2 — Care Passport completo

<!-- hcg:F.2 -->
Epic: #11

Responsável lógico: Julio — Operacional
Tipo: Story | Prioridade: P2 | Wave: 4 | Estimativa: a estimar após MVP
Status: backlog

## Contexto
Hackathon de 36h; Epic Post-MVP.

## Objetivo
Care Passport completo

## Escopo
Pesquisar viabilidade e requisitos de care passport completo após o hackathon.

## Fora de escopo
Implementação durante as 36 horas; não comprometer MVP.

## Dependências
- Blocked by #43

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Contrato futuro exige ADR e revisão
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- a definir após ADR pós-MVP

## Critérios de aceite
- [ ] ADR e escopo aprovados após MVP
- [ ] Requisitos técnicos/legais e riscos verificados antes de implementar

## Tasks / subtasks
- [ ] F.2.T1 — Implementar: Pesquisar viabilidade e requisitos de care passport completo após o hackathon. (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] F.2.T2 — Verificar: Plano de testes e compatibilidade Expo Go definidos antes de instalar. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- Plano de testes e compatibilidade Expo Go definidos antes de instalar

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### F.3 — Integração de pagamentos reais

<!-- hcg:F.3 -->
Epic: #11

Responsável lógico: Matheus — Operacional
Tipo: Story | Prioridade: P2 | Wave: 4 | Estimativa: a estimar após MVP
Status: backlog

## Contexto
Hackathon de 36h; Epic Post-MVP.

## Objetivo
Integração de pagamentos reais

## Escopo
Pesquisar viabilidade e requisitos de integração de pagamentos reais após o hackathon.

## Fora de escopo
Implementação durante as 36 horas; não comprometer MVP.

## Dependências
- Blocked by #43

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Contrato futuro exige ADR e revisão
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- a definir após ADR pós-MVP

## Critérios de aceite
- [ ] ADR e escopo aprovados após MVP
- [ ] Requisitos técnicos/legais e riscos verificados antes de implementar

## Tasks / subtasks
- [ ] F.3.T1 — Implementar: Pesquisar viabilidade e requisitos de integração de pagamentos reais após o hackathon. (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] F.3.T2 — Verificar: Plano de testes e compatibilidade Expo Go definidos antes de instalar. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- Plano de testes e compatibilidade Expo Go definidos antes de instalar

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### F.4 — Verificação automatizada de registros profissionais

<!-- hcg:F.4 -->
Epic: #11

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P2 | Wave: 4 | Estimativa: a estimar após MVP
Status: backlog

## Contexto
Hackathon de 36h; Epic Post-MVP.

## Objetivo
Verificação automatizada de registros profissionais

## Escopo
Pesquisar viabilidade e requisitos de verificação automatizada de registros profissionais após o hackathon.

## Fora de escopo
Implementação durante as 36 horas; não comprometer MVP.

## Dependências
- Blocked by #43

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Contrato futuro exige ADR e revisão
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- a definir após ADR pós-MVP

## Critérios de aceite
- [ ] ADR e escopo aprovados após MVP
- [ ] Requisitos técnicos/legais e riscos verificados antes de implementar

## Tasks / subtasks
- [ ] F.4.T1 — Implementar: Pesquisar viabilidade e requisitos de verificação automatizada de registros profissionais após o hackathon. (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] F.4.T2 — Verificar: Plano de testes e compatibilidade Expo Go definidos antes de instalar. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- Plano de testes e compatibilidade Expo Go definidos antes de instalar

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### F.5 — Integração WhatsApp

<!-- hcg:F.5 -->
Epic: #11

Responsável lógico: Matheus — Operacional
Tipo: Story | Prioridade: P2 | Wave: 4 | Estimativa: a estimar após MVP
Status: backlog

## Contexto
Hackathon de 36h; Epic Post-MVP.

## Objetivo
Integração WhatsApp

## Escopo
Pesquisar viabilidade e requisitos de integração whatsapp após o hackathon.

## Fora de escopo
Implementação durante as 36 horas; não comprometer MVP.

## Dependências
- Blocked by #43

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Contrato futuro exige ADR e revisão
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- a definir após ADR pós-MVP

## Critérios de aceite
- [ ] ADR e escopo aprovados após MVP
- [ ] Requisitos técnicos/legais e riscos verificados antes de implementar

## Tasks / subtasks
- [ ] F.5.T1 — Implementar: Pesquisar viabilidade e requisitos de integração whatsapp após o hackathon. (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] F.5.T2 — Verificar: Plano de testes e compatibilidade Expo Go definidos antes de instalar. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- Plano de testes e compatibilidade Expo Go definidos antes de instalar

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### F.6 — Notificações reais

<!-- hcg:F.6 -->
Epic: #11

Responsável lógico: Gabriel — Operacional
Tipo: Story | Prioridade: P2 | Wave: 4 | Estimativa: a estimar após MVP
Status: backlog

## Contexto
Hackathon de 36h; Epic Post-MVP.

## Objetivo
Notificações reais

## Escopo
Pesquisar viabilidade e requisitos de notificações reais após o hackathon.

## Fora de escopo
Implementação durante as 36 horas; não comprometer MVP.

## Dependências
- Blocked by #43

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Contrato futuro exige ADR e revisão
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- a definir após ADR pós-MVP

## Critérios de aceite
- [ ] ADR e escopo aprovados após MVP
- [ ] Requisitos técnicos/legais e riscos verificados antes de implementar

## Tasks / subtasks
- [ ] F.6.T1 — Implementar: Pesquisar viabilidade e requisitos de notificações reais após o hackathon. (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] F.6.T2 — Verificar: Plano de testes e compatibilidade Expo Go definidos antes de instalar. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- Plano de testes e compatibilidade Expo Go definidos antes de instalar

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### F.7 — Recorrência avançada

<!-- hcg:F.7 -->
Epic: #11

Responsável lógico: Julio — Operacional
Tipo: Story | Prioridade: P2 | Wave: 4 | Estimativa: a estimar após MVP
Status: backlog

## Contexto
Hackathon de 36h; Epic Post-MVP.

## Objetivo
Recorrência avançada

## Escopo
Pesquisar viabilidade e requisitos de recorrência avançada após o hackathon.

## Fora de escopo
Implementação durante as 36 horas; não comprometer MVP.

## Dependências
- Blocked by #43

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Contrato futuro exige ADR e revisão
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- a definir após ADR pós-MVP

## Critérios de aceite
- [ ] ADR e escopo aprovados após MVP
- [ ] Requisitos técnicos/legais e riscos verificados antes de implementar

## Tasks / subtasks
- [ ] F.7.T1 — Implementar: Pesquisar viabilidade e requisitos de recorrência avançada após o hackathon. (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] F.7.T2 — Verificar: Plano de testes e compatibilidade Expo Go definidos antes de instalar. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- Plano de testes e compatibilidade Expo Go definidos antes de instalar

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.


### F.8 — Integração geográfica real

<!-- hcg:F.8 -->
Epic: #11

Responsável lógico: Lucas — Operacional
Tipo: Story | Prioridade: P2 | Wave: 4 | Estimativa: a estimar após MVP
Status: backlog

## Contexto
Hackathon de 36h; Epic Post-MVP.

## Objetivo
Integração geográfica real

## Escopo
Pesquisar viabilidade e requisitos de integração geográfica real após o hackathon.

## Fora de escopo
Implementação durante as 36 horas; não comprometer MVP.

## Dependências
- Blocked by #43

Dependências representadas por referências reais e labels; relações nativas da API não foram configuradas pelo conector. Não marcar Ready enquanto dependências/condições não estiverem integradas e validadas.

## Contratos envolvidos
Contrato futuro exige ADR e revisão
Mudanças centrais exigem reserva na Issue e revisão arquitetural.

## Arquivos previstos
- a definir após ADR pós-MVP

## Critérios de aceite
- [ ] ADR e escopo aprovados após MVP
- [ ] Requisitos técnicos/legais e riscos verificados antes de implementar

## Tasks / subtasks
- [ ] F.8.T1 — Implementar: Pesquisar viabilidade e requisitos de integração geográfica real após o hackathon. (mesmo responsável, contratos e arquivos desta Story; aceite acima).
- [ ] F.8.T2 — Verificar: Plano de testes e compatibilidade Expo Go definidos antes de instalar. Registrar SHA e resultado no PR (mesmo responsável; evidências nos testes/docs previstos).

## Testes obrigatórios
- Plano de testes e compatibilidade Expo Go definidos antes de instalar

## Definition of Done
Aceite comprovado, CI atual, sem segredos, contratos/permissões revisados, revisão por identidade independente, merge pelo árbitro e integração validada. Não fechar por código escrito. Consulte .agents/definition-of-done.md.

