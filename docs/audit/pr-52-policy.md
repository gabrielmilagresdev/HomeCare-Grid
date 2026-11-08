# Diagnóstico e correção do PR #52

## Estado observado
PR #52: develop → main, título original Develop, sem descrição, seis commits e 70 arquivos, head 6dbaa779d39635bd6525d255f72620bc01cff412. O conteúdo é somente a fundação do PR #12, não a jornada completa do MVP. main está no commit inicial 104ab172c5d60bc249a75172bbc5d251a4eef363.

[Run original](https://github.com/gabrielmilagresdev/HomeCare-Grid/actions/runs/42433814330): quality SUCCESS; pr-policy FAILURE em check-pr por ausência de Refs #numero. Logs completos de ambos os jobs inspecionados: tipos, lint, 23 testes Node, 1 UI, Expo check, doctor 20/20 e bundles aprovados; 31 advisories baixos/moderados já conhecidos, nenhum alto/crítico no audit daquele run. Não apareceu outra falha bloqueante de quality.

PR #12 foi mergeado em develop. Não havia revisões registradas nos PRs #12/#52; merge não comprova aceite independente. #2 segue aberta/in-review; #17 aberta/blocked e branches sem proteção. #41 aberta/blocked depende de #40/#34; #42 aberta/blocked depende de #17/#40/#34; #43 aberta/blocked depende de #41/#42. Nenhuma dessas Issues foi fechada, desbloqueada ou recebeu integration:verified nesta correção.

## Causa e tratamento
A falha imediata foi a descrição ausente. Também havia lacunas: qualquer Issue pronta poderia ser usada para main; bootstrap saltava a validação; dependências só eram extraídas do texto editável; edição de descrição não disparava workflow; script lia o snapshot do evento, sem conferir metadados atuais/SHA.

Classificação baseada no diff: promoção inicial da fundação, sem declaração de release MVP. Criada [#53](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/53), com dependências #2/#17, critérios próprios e papel Lucas — Árbitro. #52 foi convertido para Draft, descrito e vinculado via Refs #53. #43 continua reservada à release final.

[Issue de remediação #54](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/54), Gabriel — Operacional; branch fix/54-pr-policy do develop auditado. Reserva: scripts/check-pr, módulo/testes de política, workflow e este diagnóstico. Não altera app, domínio, package.json, lockfile ou arquitetura. Workspace de autoria/testes em .runtime/pr-54, preservando o checkout local anterior sem commits.

## Política resultante
- Operacionais: feature|fix|chore/<Issue>-descricao → develop, Issue operacional aberta e estado elegível.
- Bootstrap: #2/chore/2-bootstrap-foundation → develop, sem pular status/dependências.
- Release final: develop do próprio repo → main, Issue #43, dependências mínimas #41/#42 e checklist de aceite comprovado.
- Promoção inicial única: somente PR #52 + Issue #53 + main no commit inicial auditado; dependências mínimas #2/#17 e aceite. Não há exceção por label ou origem develop; outro PR/main avançado é recusado. Retirar esse caso ao encerrar a promoção, por PR revisado.
- PRs/épicos/Issues encerradas, branch incompatível, backlog, blocked, status ausente, mapeamento ausente e dependência não closed/completed/integration:verified são recusados com motivo.
- Dependências = união do texto vivo, contratos Agile da base imutável e pisos críticos. O código do próprio PR não pode reduzir o grafo lido da base. Como main inicial não tem contratos, usa o commit imutável de fundação 6dbaa779d39635bd6525d255f72620bc01cff412 nesse único contexto.
- Consulta descrição/Issues atuais pela API com token read-only; recusa execução antiga se número, refs ou SHA mudou. Erros de API falham fechados sem imprimir respostas/tokens.
- Revisão independente e proteção continuam gates EXTERNOS de merge. Check verde valida rastreabilidade/dependências, não concede autorização para integrar. #17 continua pendente; não se afirma enforcement ativo.

## Revalidação
Workflow inclui opened/synchronize/reopened/edited/ready_for_review/converted_to_draft, mantendo quality e permissões read-only; sem pull_request_target. Edição da descrição passa a disparar CI sem commit artificial. Mudança de Issue pode ser verificada por rerun do job com o mesmo SHA, pois o adapter lê dados atuais.

Reexecutar o run antigo não instala código novo. A correção será validada em PR específico para develop; só após integração revisada chegará ao head de #52. Não houve commit direto em develop/main nem merge nesta execução. #52 deve continuar bloqueado após a correção enquanto #2/#17/#53 não forem elegíveis.

## Testes e limitações
32 testes Node de política passam localmente: operacional válido, falta/erro de referência, backlog/blocked, dependência pendente/sem evidência/not_planned, grafo canônico, bootstrap sem bypass, release elegível/bloqueada, critérios pendentes, promoção limitada, fork, SHA obsoleto, descrição atual e falha API. CI executa esses testes além dos testes existentes e checks Expo.

A simulação com snapshots REAIS de #52/#53/#2/#17 também deve recusar a integração e listar ambos os pré-requisitos. Fixtures elegíveis são testes hipotéticos; não significam que as Issues reais foram concluídas.

Validação completa da mudança é feita na CI do PR de correção. Sem teste físico Expo Go; nenhuma chamada Supabase/alteração de funcionalidade. Nenhuma revisão, aprovação, branch protection ou merge foi simulada.

## Ação do árbitro
Revisar a correção de #54 por identidade independente e resolver controles de #17; autorizar integração apenas pelos gates reais. Auditar o aceite de #2 separadamente, sem fechar por já haver merge. Depois validar #53 e o SHA atual de #52. #41/#42/#43 pertencem à release MVP futura e continuam bloqueadas.

Fontes: [eventos pull_request](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request), [reruns mantêm SHA/ref originais](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs).
