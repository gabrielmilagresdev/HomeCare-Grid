# Fluxo

main estável; develop integração. Bootstrap chore/2-bootstrap-foundation -> develop no commit inicial. Tarefas feature/<issue>-slug, fix/<issue>-slug, chore/<issue>-slug. Release develop -> main revisada pelo árbitro.

Issue pronta -> dependências integradas -> reserva de workspace/branch/arquivos -> implementação/testes -> PR develop -> revisão independente -> correções -> merge pelo árbitro -> validação -> fechamento da Issue.

Labels substituem Projects: status:backlog/ready/in-progress/in-review/changes-requested/done/blocked. Ready exige dependências e segurança válidas; labels não são bloqueio técnico. Sem automação noturna ativa. Não executar concorrência no mesmo checkout. Runbook em docs/operations/runbook.md.
