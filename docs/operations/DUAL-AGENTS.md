# Início imediato — dois agentes Lucas

Não recrie o clone em uso nem descarte trabalho local. O aplicativo existente está em codex/hackathon-mvp, commit b244face4a8a21301198f13d3b29911e45bf519e, no PR #62. A simplificação está no PR #60.

## Operacional

Abrir o clone atual em uma instância Codex. Conferir git status e branch; preservar mudanças. Trabalhar na branch da funcionalidade a partir de develop atualizado, aproveitando o MVP já publicado. Pode alterar todo o projeto e instalar bibliotecas Expo Go; não faz merge.

Prompt: "Atue como Lucas Operacional. Leia AGENTS.md e a Issue. Aproveite codex/hackathon-mvp, implemente o necessário, execute/corrija testes e abra/atualize PR. Não aguarde encerramento de Issues administrativas nem faça merge."

## Árbitro

Usar outro clone/checkout, sem editar o operacional. Revisar primeiro PR #60 no SHA atual e, quando quality/pr-policy e regras permitirem, integrá-lo. Depois atualizar a branch do PR #62 com develop por integração normal, preservando os commits de Lucas; executar checks e revisar/integrar a jornada existente. Nunca reset/clean/force push para sincronizar.

Prompt: "Atue como Lucas Árbitro. Leia .agents/arbiter.md. Revise código, contratos, segurança e testes dos PRs #60/#62. Corrija integração/infra quando preciso. Faça merge somente com quality/pr-policy atuais aprovados e regras nativas satisfeitas. Não registrar análise automática como aprovação humana."

CLI opcional, no checkout escolhido, com a autenticação já autorizada do Codex/conector:

```text
codex --no-daemon --strict-config --ask-for-approval never --sandbox workspace-write -c sandbox_workspace_write.network_access=true --cd CAMINHO_DO_CHECKOUT exec --json --ephemeral "PROMPT_DO_PAPEL"
```

A configuração versionada usa never/workspace-write e rede habilitada para comandos do projeto; não altera a política gerenciada desta sessão. Não usar Full Access no host. Full Access só seria apropriado em ambiente dedicado e isolado, que não foi provisionado aqui. Não acessar diretórios pessoais/outros projetos nem enviar credenciais ao chat.

## Fluxo

Issue → código/testes → PR para develop. Revisão do árbitro → correções → CI no SHA atual → merge → próxima funcionalidade. Um número principal em linha Refs #numero basta para rastreabilidade. Qualquer branch própria é aceita, inclusive codex/hackathon-mvp. Não há owner/escopo rígido por arquivo.

Se há impedimento técnico real no PR, registrar em "## Bloqueios técnicos" com checklist pendente; a política recusa esse bloqueio até ser corrigido. Estados de Issue e encerramento de #2/#17/#53/#56/#58/#59 não são gates. Não fechar itens para passar CI.

O backlog preserva dependências entre funcionalidades e seu histórico em originalDependsOn. A fila diagnóstica mostra roteiro, não lock/autorizações: node scripts/dual-agent.mjs plan ou queue com snapshot de Issues. Dependência pode ser satisfeita pelo código já existente ou pelo mesmo PR; conferir testes.

## Verificações

npm ci; npm run typecheck; npm run lint; npm test; testes de política/dual; npm run test:ui; npm run check:foundation; npm run check:secrets; Expo check/doctor e bundle na CI existente. Não retirar checks nem usar bypass. Teste físico Expo Go continua sendo uma verificação de produto, não uma aprovação administrativa de infraestrutura.

O PR #62 passou quality no commit original. Seu pr-policy antigo recusou status/dependências formais; sincronizar com develop depois da simplificação e exigir ambos os checks atuais antes de merge. Não tratar uma CI antiga como aprovação de um novo SHA.

## Ruleset temporário e restauração

Ruleset 26781801, main/develop: PR obrigatório; quality/pr-policy vinculados ao Actions 15368; branch atualizada; conversas resolvidas; sem exclusão/force push/bypass. Aprovações obrigatórias=0; Code Owners, último push e approval extra de Copilot desativados, conforme autorização específica. Revisão técnica do árbitro continua no fluxo.

Nenhuma ação administrativa adicional é necessária para aplicar essa alteração: a API confirmou o estado salvo. Ao final do hackathon, restaurar os campos do objeto restore em ruleset-hackathon.json pela mesma página Settings → Rulesets → 26781801, ou por PUT autenticado /repos/gabrielmilagresdev/HomeCare-Grid/rulesets/26781801. Restaurar uma aprovação, Code Owners, último push e approval extra, preservando CI e proteções. O snapshot temporary registra o estado autorizado.

O código útil do modo legado e as atribuições históricas permanecem no Git. Não são pré-requisitos: cinco ambientes, broker, sistema de reservas, piloto, filtros de arquivo, novos logins técnicos ou evidência manual de cada decisão rotineira.
