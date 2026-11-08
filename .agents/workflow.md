# Fluxo

main estável; develop integração. Bootstrap chore/2-bootstrap-foundation -> develop no commit inicial. Tarefas feature/<issue>-slug, fix/<issue>-slug, chore/<issue>-slug. Release develop -> main revisada pelo árbitro.

Issue pronta -> dependências integradas -> reserva de workspace/branch/arquivos -> implementação/testes -> PR develop -> revisão independente -> correções -> merge pelo árbitro -> validação -> fechamento da Issue.

Labels substituem Projects: status:backlog/ready/in-progress/in-review/changes-requested/done/blocked. Ready exige dependências e segurança válidas; labels não são bloqueio técnico. Sem automação noturna ativa. Não executar concorrência no mesmo checkout. Runbook em docs/operations/runbook.md.

Infraestrutura executável em scripts/autonomy; comandos oficiais em docs/operations/START-AGENTS.md. Estado atual: NOT READY — BLOCKERS REMAIN. Perfis/containers escritos não são agentes ativos.

Apenas o coordenador confiável acessa o runtime e o Docker host. Workers recebem workspace exclusivo e chave de proxy de modelo; nenhuma credencial GitHub, controle do broker, Docker socket ou HOME pessoal. Instalação de dependências ocorre antes, em fase confiável separada. Comandos do agente continuam com network_access=false.

Reservas centralizadas no broker/SQLite local usam transação, fencing e grupos de recursos. Expiração não libera arquivos: quarentena até parada do processo e reconciliação remota. Dois executores nunca usam o mesmo checkout. Até duas execuções por Issue; nova tentativa requer changes-requested e PR da própria identidade, com novo workspace. Orçamento máximo 90 minutos, logs redigidos e checkpoint.

A Issue #56 entrega código e testes de infraestrutura. #58 comprova o piloto real, limitado a dois arquivos e um operador; não depende de #2/#17 porque produz evidências para aceitá-las. Nenhuma Story do MVP é liberada pelo piloto. Execução geral exige #2/#17 aceitas, credenciais segregadas e todas as evidências atuais. Não editar os pré-requisitos para simular Ready.
