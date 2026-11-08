# Ownership histórico e executor atual

| Agente | Módulos predominantes |
| --- | --- |
| Gabriel — Operacional | UI/theme, marketplace e bookings UI, CI |
| Lucas — Operacional | domínio, ports, matching, concierge, bookings, autorização, migrations, navegação global |
| Julio — Operacional | common, perfis, Family Hub UI, pagamentos simulados |
| Matheus — Operacional | auth, fixtures, demo, fluxo profissional, demanda UI, demo docs |
| Lucas — Árbitro | revisão independente, integração e auditoria |

Centrais: package/lock, app.json, tsconfig, app/_layout, domain/**, services/contracts.ts, supabase/**, .github/**, AGENTS.md, .agents/**, .codex/**. Uma Issue editando cada grupo; reserva na Issue com responsável, base SHA, escopo/expiração. Árbitro resolve disputas. Ownership lógico não é permissão.

Mudança compartilhada exige seção Contratos no PR e revisão arquitetural. Não integrar por cópia entre workspaces.

## DUAL_AGENT_MODE

A tabela acima e backlog.json registram responsáveis originais. Executor atual de todas as Stories MVP operacionais: Lucas Operacional; revisão/integração: Lucas Árbitro. As Issues recebem bloco explícito de responsável original/executor, sem reescrever autoria, labels owner ou critérios. Stories F.* continuam pós-MVP e não são puxadas para a fila.

Uma implementação por vez. A precedência da fila respeita dependências canônicas e textuais; ordem de preferência não dispensa pré-requisito. Nenhuma Story é concluída por redistribuição.
