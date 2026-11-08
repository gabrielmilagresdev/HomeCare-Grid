# Segurança e isolamento externo

Uma conexão GitHub como gabrielmilagresdev; identidade independente do árbitro não fornecida. Nenhum container/workspace operacional provisionado. Repositório pessoal privado. Merge exclusivo NÃO é garantido por documentação.

Provisionar cinco ambientes efêmeros: gabriel-operational, lucas-operational, julio-operational, matheus-operational, lucas-arbiter. Cada um tem clone/worktree, branch, temporário, cache, logs e credenciais próprias. Worktree isola edição, não credenciais/processos. Preferir containers/VMs sem home, SSH/credenciais do host, projetos alheios, Docker socket ou admin.

Preparação confiável executa npm ci. Runtime offline monta só workspace/temp. Gateway GitHub autentica papéis: operadores criam branches próprias/PR; só árbitro integra. contents:write sozinho pode permitir merge; usar ruleset/restrição efetiva ou broker GitHub App com tokens curtos e negação explícita de merge/main/develop. Nunca mesmo token nos cinco ambientes.

Rede desativada no exemplo Codex. Allowlist externa necessária: registry.npmjs.org na preparação; github.com/api.github.com via serviço autorizado; modelo somente endpoint necessário. network_access=true sozinho não restringe destinos. Nenhuma allowlist foi ativada aqui.

Proteção desejada main/develop: PR, aprovação independente, stale approvals descartadas, último push aprovado por outro, conversas resolvidas, quality/pr-policy exigidos, sem force/delete, enforce admins/sem bypass. CODEOWNERS exige revisor real diferente do autor; não inventado.

A API administrativa da integração retorna 403. Plano privado pode limitar proteções. Credencial atual dona do repo não serve como operador limitado. Autonomia bloqueada até configuração e teste de merge negado ao operador e permitido ao árbitro.
