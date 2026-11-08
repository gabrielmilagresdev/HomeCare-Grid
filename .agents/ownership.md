# Ownership

| Agente | Módulos predominantes |
| --- | --- |
| Gabriel — Operacional | UI/theme, marketplace e bookings UI, CI |
| Lucas — Operacional | domínio, ports, matching, concierge, bookings, autorização, migrations, navegação global |
| Julio — Operacional | common, perfis, Family Hub UI, pagamentos simulados |
| Matheus — Operacional | auth, fixtures, demo, fluxo profissional, demanda UI, demo docs |
| Lucas — Árbitro | revisão independente, integração e auditoria |

Centrais: package/lock, app.json, tsconfig, app/_layout, domain/**, services/contracts.ts, supabase/**, .github/**, AGENTS.md, .agents/**, .codex/**. Uma Issue editando cada grupo; reserva na Issue com responsável, base SHA, escopo/expiração. Árbitro resolve disputas. Ownership lógico não é permissão.

Mudança compartilhada exige seção Contratos no PR e revisão arquitetural. Não integrar por cópia entre workspaces.
