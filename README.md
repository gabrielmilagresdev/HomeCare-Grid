# HomeCare Grid

**O cuidado certo, onde você está.**

Fundação mobile para conectar pessoas com barreiras de deslocamento a profissionais independentes de cuidado e apoio domiciliar. Não exclusiva para idosos. Papéis: pessoa atendida, contratante autorizado e profissional; uma pessoa pode ter múltiplos papéis.

## Estado do bootstrap

Scaffold Expo Go SDK 58 + React Native + Expo Router + TypeScript strict; navegação demonstrativa, tema, contratos/validadores, helpers puros e catálogo sintético. Fluxos completos de marketplace, Auth, reservas persistentes, Family Hub, Concierge remoto e pagamentos ainda são backlog. Não há Supabase remoto configurado.

Nenhum dado real, diagnóstico, prontuário, pagamento real ou módulo que exija development build. FamilyPay futuro é exclusivamente simulado neste MVP. Preço premium R$ 49,90 é hipótese comercial.

## Executar

Node 24.11.1 e npm 11.6.2. Com o lockfile versionado:

```sh
npm ci
npm start
```

Abrir QR no Expo Go compatível com SDK 58. O scaffold não precisa de .env ou credenciais; .env.example contém apenas configuração pública reservada. Consultar docs/demo/demo-flow.md para smoke e registro de evidências.

Neste sandbox, rede npm/Git e escrita em .git estão bloqueadas. O conector GitHub autorizado publica a branch remota; CI resolve/valida dependências. O lockfile gerado na CI foi incorporado; consulte os checks atuais do PR para o resultado final. Não inferir teste físico de bundle.

## Qualidade

```sh
npm run typecheck
npm run lint
npm test
npm run test:ui
npm run check:foundation
npm run check:secrets
npx expo install --check
npm run doctor
npm run bundle
```

npm test roda regras TS reais via Node 24 sem dependências. UI usa Jest/Expo e React Native Testing Library. Scanner de segredos é heurístico. CI tem quality e pr-policy; isso não ativa proteção de branches por si só.

## Arquitetura e governança

- [Entrada dos agentes](AGENTS.md), [arquitetura](docs/architecture/overview.md), [modelo](docs/architecture/data-model.md), [permissões](docs/architecture/access-control.md).
- [Backlog com links](docs/agile/backlog.md), [dependências e waves](docs/agile/dependencies.md), [ownership](.agents/ownership.md).
- [Auditoria inicial](docs/audit/initial-state.md), [relatório de entrega](docs/audit/delivery.md).
- [Isolamento e segurança](docs/operations/security-and-isolation.md), [runbook](docs/operations/runbook.md), [revisão do árbitro](.agents/arbiter.md).

Fluxo: Issue pronta -> branch individual/workspace isolado -> PR develop -> revisão independente -> merge por Lucas Árbitro -> integração validada -> Issue fechada. Operadores nunca fazem merge. main recebe release por PR de develop. Fundação pendente de revisão/integração; não iniciar Stories dependentes.

Um único token contents:write não garante isolamento de merges. API administrativa da integração indisponível e identidade independente do árbitro pendente: execução autônoma bloqueada até enforcement externo verificado. Não há executor noturno ativo, quadro Projects criado, containers ou credenciais separadas provisionadas.

## Estrutura

```text
app/                         rotas mobile demonstrativas
src/components/{ui,common}/  componentes acessíveis
src/domain/{types,schemas,rules}/ contratos únicos e regras
src/services/{demo}/         ports e catálogo sintético
src/testing/                 fixtures
src/theme/                   identidade visual
supabase/                    requisitos para backend futuro
tests/ scripts/              testes e ferramentas
.agents/ .codex/ .github/     políticas, config e CI
docs/{architecture,adr,agile,audit,demo,operations}/
```

Features surgirão por Story, sem diretórios vazios. Nunca editar contratos/configurações centrais em paralelo sem reserva. Dados externos passam por parser; mutações remotas exigem RLS e operação atômica para agenda.

## Backlog e atualização

`npm run backlog:render` regenera docs a partir de docs/agile/backlog.json e github-map.json. `npm run backlog:plan` é dry-run. Reconciliação de Issues existentes exige ambiente externo autorizado com token efêmero, nunca credencial pessoal lida pelo agente. O script não faz merge nem fecha Issues.

31 Stories MVP, oito itens pós-MVP, dez Epics. Responsáveis lógicos não são usernames inventados; Lucas Operacional e Lucas Árbitro estão explicitamente separados. Tasks são checklists T1/T2 nas Stories. Dependências usam links reais e status blocked; relações nativas não foram criadas pelo conector.

## Referências de compatibilidade

[Expo Go atual](https://expo.dev/go), [SDK 58](https://docs.expo.dev/versions/v58.0.0/), [versões nativas oficiais](https://raw.githubusercontent.com/expo/expo/sdk-58/packages/expo/bundledNativeModules.json), [configuração Codex](https://learn.chatgpt.com/docs/config-file/config-reference). Versões diretas fixas; lockfile deve ser revisado e versionado antes de concluir bootstrap.
