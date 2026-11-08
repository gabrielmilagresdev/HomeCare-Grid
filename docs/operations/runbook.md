# Iniciar agentes

Nenhum executor noturno ativo. Não iniciar concorrência neste checkout. CI, revisão independente e integração da fundação em develop vêm primeiro.

1. Administrador provisiona cinco ambientes/credenciais, mapeia usernames reais e verifica proteções.
2. Coordenador seleciona Issue com dependências integradas e escopo livre. Executor confiável adquire lock transacional único repository+issue com lease de 90 min. Labels/assignees não são lock. Serviço ainda não existe.
3. Clone/worktree exclusivo, branch feature/<numero>-slug do SHA develop. Preparação npm ci; cache/log próprios. Não copiar arquivos para integrar.
4. Fornecer prompt .agents/operational.md com nome/Issue. CLI observado 0.166.0-alpha.6: codex exec --strict-config --sandbox workspace-write --json --output-last-message .runtime/<issue>/last.md - (prompt via stdin). approval_policy vem do config; não usar flags que removam sandbox. Revalidar --help/esquema na versão real antes de lançar.
5. Uma tarefa por operador, quatro operadores no máximo, 90 min e duas tentativas corretivas. Checkpoint com agente/Issue/branch/base/head/arquivos/testes/PR/bloqueios. Falha preserva branch; lease só libera com processo parado.
6. PR In Review -> árbitro em quinto ambiente usa .agents/arbiter.md, GitHub real e CI atual. Mesma identidade do autor bloqueia aprovação. Só depois de merge/validação fechar Issue e liberar dependentes.

Parada: cancelar executor, revogar token efêmero, preservar checkpoint. Sem loops ilimitados ou exclusão de histórico. Config versionado não altera política gerenciada da sessão atual nem substitui isolamento do SO.

Fontes: [configuração](https://learn.chatgpt.com/docs/config-file/config-reference), [segurança](https://learn.chatgpt.com/docs/agent-approvals-security).
