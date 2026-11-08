# Configurar proteção externa

Estado observado: main inicialmente protected=false, rulesets vazios; develop criada sem proteção comprovada. A integração GitHub não tem API administrativa efetiva (403) e não oferece operação de criação de rulesets/proteções. Nenhuma proteção foi ativada.

Administrador deve configurar [branches](https://github.com/gabrielmilagresdev/HomeCare-Grid/settings/branches) ou [rulesets](https://github.com/gabrielmilagresdev/HomeCare-Grid/settings/rules) para main e develop:
- PR obrigatório, uma aprovação independente e descarte após novo commit.
- Aprovação do último push por pessoa diferente; conversas resolvidas.
- Checks obrigatórios quality e pr-policy, branch atualizada.
- Bloquear force push, exclusão, bypass e aplicar a administradores.
- Revisão de arquivos críticos por identidade independente em CODEOWNERS quando o username for conhecido.

Repositório pessoal privado pode exigir plano compatível. Não mudar visibilidade/plano, criar contas/tokens ou conceder permissões sem autorização específica. API do conector não prova plano contratado. [Referência GitHub](https://docs.github.com/en/rest/branches/branch-protection).

Merge exclusivo precisa enforcement adicional: restrição de atualização para GitHub App árbitro/identidade técnica e conjunto separado de regras sem bypass para revisão/checks, ou broker que negue merge e atualizações protegidas aos operadores. Verificar suporte real do plano. Separação de prompts e token contents:write não garantem isso.

Evidência requerida em #17: GET de cada regra efetiva, tentativa operacional negada, autoaprovação recusada, CI falhando bloqueia, aprovação invalidada em novo SHA e integração válida pelo árbitro. Não marcar Ready/autonomia antes dessa prova. Não usar conta autora como CODEOWNER/revisor independente.

Segregação e provisionamento externos não foram realizados; nenhuma credencial foi solicitada/extraída nesta tarefa.
