# Distribuição e início das tarefas

| Agente | Stories MVP | Estimativa | Primeiro escopo após gates |
| --- | --- | --- | --- |
| Gabriel — Operacional | 5 | 11h | [1.1 #18](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/18), UI/theme |
| Lucas — Operacional | 13 | 28h | [2.2 #19](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/19), depois [3.4 #25](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/25); domínio/contratos serializados |
| Julio — Operacional | 5 | 11h | [1.3 #21](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/21) ou [3.1 #24](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/24); escopos separados |
| Matheus — Operacional | 5 | 11h | [2.3 #23](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/23) ou [2.1 #22](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/22); reservar src/lib/config se necessário |
| Lucas — Árbitro | 3 | 4h + revisão contínua | [0.5 #17](https://github.com/gabrielmilagresdev/HomeCare-Grid/issues/17), credenciais/proteção externa e revisão do bootstrap |

Responsáveis são nomes lógicos/labels; usernames técnicos ainda não mapeados. O mesmo nome humano Lucas não autoriza autoaprovação. Nenhuma Story dependente está Ready. #17 pode avançar na configuração externa antes da integração do código, mas está bloqueada por API administrativa/identidade.

65 horas-agente estimadas para 31 Stories; bootstrap #2 é entrega agregadora da preparação, não duplicar esforço já realizado de 0.1–0.4. Lucas concentra 28h e o caminho crítico; reservar revisão cedo. P0 de Lucas Operacional fica em cerca de 21h; Concierge, Demand agregado, continuidade e FamilyPay são corte de escopo se ameaçarem a jornada. Não redistribuir contratos sem revisão, mesmo para ocupar capacidade livre.

Waves e grafo completo em dependencies.md. Início só após fundação integrada, revisão independente e controles de merge verificados. Cada agente precisa de ambiente próprio; este checkout não pode ser compartilhado.

Para lançar cada operador: preencher nome/Issue no prompt .agents/operational.md, confirmar dependências e reserva, usar runbook.md em ambiente isolado. Árbitro usa .agents/arbiter.md em quinto ambiente com identidade diferente do autor. Nenhum agente foi lançado automaticamente.
