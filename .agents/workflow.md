# Fluxo

main estável; develop integração. Bootstrap chore/2-bootstrap-foundation -> develop no commit inicial. Tarefas feature/<issue>-slug, fix/<issue>-slug, chore/<issue>-slug. Release develop -> main revisada pelo árbitro.

Issue pronta -> dependências integradas -> reserva de workspace/branch/arquivos -> implementação/testes -> PR develop -> revisão independente -> correções -> merge pelo árbitro -> validação -> fechamento da Issue.

Labels substituem Projects: status:backlog/ready/in-progress/in-review/changes-requested/done/blocked. Ready exige dependências e segurança válidas; labels não são bloqueio técnico. Sem automação noturna ativa. Não executar concorrência no mesmo checkout. Runbook em docs/operations/runbook.md.

## Operação atual: DUAL_AGENT_MODE

Lucas Operacional executa todas as Stories MVP, uma de cada vez, em branch própria baseada em develop. Lucas Árbitro trabalha em outro checkout, revisa o SHA atual e integra somente após os gates. A próxima implementação aguarda integração validada da anterior. A fila diagnóstica e a precedência real estão em scripts/dual-agent.mjs e .agents/mode.json.

#56/#58 e PR #57 são infraestrutura opcional do modo legado de cinco agentes. Não são pré-requisitos do modo dual. #2/#17, dependências de código, critérios de aceite, CI e revisão independente continuam obrigatórios. Fluxo e início em docs/operations/DUAL-AGENTS.md. Nenhum daemon/autonomia irrestrita é ativado por essa adaptação.
