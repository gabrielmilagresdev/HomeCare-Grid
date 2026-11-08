# DUAL_AGENT_MODE — hackathon

Dois agentes, dois checkouts. Operacional: Issue → implementação → testes → PR. Árbitro: revisão → correções → CI atual → merge. Operacional pode alterar qualquer arquivo do projeto e dependências compatíveis com Expo Go, sem autorização por decisão.

Não há gates de cinco ambientes, broker, reservas, piloto, fechamento administrativo, owner de arquivo, aprovação humana, Code Owners ou último push. O histórico Agile continua em backlog.json; originalDependsOn preserva referências administrativas retiradas. Dependências técnicas entre funcionalidades continuam no plano.

A branch codex/hackathon-mvp já implementa grande parte da jornada em demo local; conferir PR #62 antes de duplicar telas/engine. Priorizar fluxo principal e demonstração, deixando pós-MVP fora da fila.

Atualizar contratos/consumidores/testes com coerência. Antes de merge, quality/pr-policy do SHA atual devem passar, sem segredos ou bloqueio técnico declarado pendente. Não afirmar backend/IA reais nem conclusão de cada Story apenas pela existência de código.

O guia de início é docs/operations/DUAL-AGENTS.md. Código legado da infraestrutura e histórico do PR #60 continuam disponíveis; nada precisa ser reprovisionado para executar esse fluxo.
