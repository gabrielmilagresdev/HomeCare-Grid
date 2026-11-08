# DUAL_AGENT_MODE

Configuração ativa: .agents/mode.json. Dois agentes lógicos: Lucas Operacional implementa todas as Stories MVP; Lucas Árbitro revisa e integra. Os responsáveis originais permanecem em backlog.json, labels owner e histórico; o bloco das Issues distingue executor atual. F.* permanece fora do MVP.

Uma implementação por vez, branch feature|fix|chore/<Issue>-slug a partir de develop, checkout exclusivo e reserva explícita de arquivos centrais. Aguardar integração validada antes da próxima Story. O árbitro pode ler/analisar em paralelo em outro checkout; não implementar correções silenciosas no checkout operacional.

Não é preciso integrar #57/#56/#58 nem provisionar cinco containers para usar este modo. As políticas desses artefatos continuam preservadas como alternativa legada. #2 e #17 continuam sendo aceites reais. Não retirar dependências de código nem fechar Issues para liberar a fila.

No GitHub, análise técnica do modelo é diferente de aprovação formal. Preferir identidade técnica de revisão diferente do autor. Se os dois agentes representam a mesma conta Lucas: Operacional abre PR, Árbitro analisa, Gabriel registra aprovação independente do SHA, Árbitro integra após CI/gates. O operacional não recebe permissão de merge; separar catálogos/ferramentas e credenciais, com teste negativo real. Dois CODEX_HOME ou a ausência do comando gh não comprovam essa negação.

Workspaces separados e sandbox nunca/workspace-write/rede de comandos desativada. Aqui "nunca" significa approval_policy=never, não acesso irrestrito. Autenticação e filtro do conector são configurados fora do workspace do operacional. Não passar tokens GitHub ao shell do agente. Não editar configuração global dos integrantes automaticamente.

Scripts diagnósticos: scripts/dual-agent.mjs. Guia com comandos, permissões e pendências: docs/operations/DUAL-AGENTS.md. Antes de qualquer execução, ler a Issue e o estado remoto atual; snapshots/labels não são locks nem autorização. Nenhum agente é iniciado por init ou check.
