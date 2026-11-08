# Entrega do bootstrap — 07/11/2026

[PR #12](https://github.com/gabrielmilagresdev/HomeCare-Grid/pull/12) de chore/2-bootstrap-foundation para develop. Nenhum merge realizado. main e develop permanecem no commit inicial até revisão independente e integração pelo árbitro.

## IMPLEMENTADO

Scaffold mobile Expo Go SDK 58, RN 0.88.1, React 19.3, Expo Router e TypeScript strict. Navegação demonstrativa para pessoa/contratante, profissional, familiar e acesso. Tema nas cores definidas, Button acessível, alvos de 48, fonte escalável e SafeArea. Não é o MVP completo.

Contratos únicos v1, Result/RemoteState, validação administrativa do Concierge, UTC/intervalos, máquina de estados, autorização familiar e matching determinístico. Catálogo sintético em adapter isolado, sem chaves. Matching não mede qualidade clínica. Regras locais não aplicam RLS/concorrência remota.

AGENTS.md, dez documentos .agents, configuração .codex, templates, arquitetura/modelo/permissões/ADR, runbook, backlog estruturado/renderizado e scripts reais. Lockfile npm v3 gerado pela CI, versões diretas exatas e peer transitivo React DOM alinhado ao React do SDK. Sem implementação web.

Estrutura final: app; src/components/ui e common; src/domain/types, schemas e rules; src/services/demo e contracts; src/testing; src/theme; supabase com requisitos futuros; tests; scripts; .agents; .codex; .github/workflows e ISSUE_TEMPLATE; docs/architecture, adr, agile, audit, demo e operations. Features surgirão por Story com conteúdo real.

## CONFIGURADO

Branches remotas develop e chore/2-bootstrap-foundation, ambas originadas de main sem reescrever histórico. CI quality/pr-policy com permissões mínimas e sem pull_request_target. Gate vincula Issue e verifica dependências fechadas com integration:verified; proteção administrativa continua necessária. Sem paths que omitam checks. PR de bootstrap não integra automaticamente.

50 Issues reais: dez Epics, 31 Stories MVP, oito itens pós-MVP e um bootstrap. Cada Story tem responsável lógico, papel, prioridade, esforço, wave, escopo, contratos, aceite, testes e Tasks T1/T2 em checklist. Hierarquia/dependências são referências reais e labels; relações nativas/sub-issues e Projects NÃO configurados pelo conector. Todas as 50 estavam abertas e nenhuma Ready na verificação remota.

Epics: [0 #1](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/1), [1 #3](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/3), [2 #4](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/4), [3 #5](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/5), [4 #6](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/6), [5 #7](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/7), [6 #8](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/8), [7 #9](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/9), [8 #10](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/10), [futuro #11](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/11). Stories/links completos em ../agile/backlog.md e github-map.json.

Distribuição MVP: Gabriel 5 Stories/11h; Lucas Operacional 13/28h; Julio 5/11h; Matheus 5/11h; Lucas Árbitro 3/4h mais revisão contínua. Assignees técnicos não inventados; labels identificam responsáveis lógicos. Árbitro explícito em #17, #42 e #43.

## TESTADO

Local: 23 testes node:test aprovados, incluindo transições, payload inválido, UTC, matching, autorização/vínculo revogado, isolamento de fixtures, DAG do backlog e scanner. check:foundation e scanner heurístico aprovados. Config verificado contra documentação oficial e validador de subconjunto TOML/chaves; inicialização autenticada/enforcement do Codex não testados. approval_policy=never foi gravado somente após autorização direta do usuário, depois de rejeição inicial da revisão automática.

[CI run 4](https://github.com/gabrielmilagresdev/HomeCare-Grid/actions/runs/42433005255): npm ci, typecheck, ESLint, 23 testes Node, um teste UI Jest/Expo, check:foundation, check:secrets, expo install --check, expo-doctor (20/20) e export Android/iOS passaram. O job terminou vermelho exclusivamente porque o lockfile gerado ainda não estava versionado; o lockfile dessa execução foi incorporado à branch. Preparação temporária removida: CI definitiva exige npm ci com lockfile existente. [Checks atuais do PR](https://github.com/gabrielmilagresdev/HomeCare-Grid/pull/12/checks) são a fonte do resultado da execução final.

A instalação reportou 31 advisories (1 baixo, 30 moderados, sem alto/crítico nesse run), para triagem em #15. Não significa segurança total. Gate audit --audit-level=high configurado na CI definitiva. Ver dependency-audit.md.

NÃO EXECUTADO: aparelho físico/Expo Go, banco Supabase, RLS, concorrência PostgreSQL, backend remoto, identidade independente e teste de merge negado ao operador. Bundle não substitui esses testes.

## PLANEJADO

MVP de descoberta -> solicitação -> aceite -> confirmação -> Family Hub, Demand com consentimento e FamilyPay opcional simulado. Auth/Supabase/migrations/Edge Functions, privacidade por recurso e constraint atômica descritas, ainda não implementadas no remoto. Nenhuma credencial de IA/service_role no app.

Waves: fundação 0–6h, paralelismo 6–16h, jornada 16–28h, demo/correções 28–36h. Caminho crítico: BOOT -> contratos/proteção -> Auth/autorização -> reservas -> concorrência/família -> jornada -> revisão/release. Lucas central é gargalo; itens P1/P2 devem ser cortados se ameaçarem a jornada P0. Ver ../agile/dependencies.md e assignments.md.

## BLOQUEADO

main e develop foram verificadas com protected=false; rulesets vazios. API de branch protection retorna 403 Resource not accessible by integration, apesar de a conta ser admin. Não há operação administrativa de escrita no conector. Não foi criado CODEOWNERS com autor como falso revisor independente. Configuração e prova de enforcement em [#17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17) e ../operations/branch-protection.md.

Falta identidade/credencial independente do árbitro e ambientes separados. contents:write sozinho não impede merge; exige rulesets/restrição ou broker GitHub App. Nenhum container/worktree operacional, lock transacional de Issues, executor/agendador ou automação noturna está ativo.

Sandbox local bloqueia rede Git/npm e .git. Arquivos estão no workspace, mas .git permanece no main inicial sem commits locais; commits foram publicados pelo conector na branch remota. Não usar este working tree em paralelo nem apagar alterações para trocar de branch. Usar clone/ambiente exclusivo após autorização de infraestrutura.

## Próximas ações e início dos agentes

Agora: administrador/árbitro podem resolver #17 e revisar o PR #12 por identidade independente. Nenhuma Story dependente deve iniciar antes da fundação integrada e gates resolvidos.

Depois: Gabriel #18 (1.1), Lucas #19 (2.2) seguido de #25 (3.4), Julio #21 (1.3) ou #24 (3.1), Matheus #23 (2.3) ou #22 (2.1). Respeitar dependências específicas e reservas. Não lançar simultaneamente tarefas centrais incompatíveis.

Provisionar cinco ambientes e credenciais conforme ../operations/security-and-isolation.md. Preencher nome/Issue no prompt .agents/operational.md; árbitro usa .agents/arbiter.md em quinto ambiente. Comandos, limites/checkpoints/parada em ../operations/runbook.md. Nenhum agente foi executado automaticamente nesta estruturação.
