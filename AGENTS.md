# HomeCare Grid — DUAL_AGENT_MODE

Expo Go, React Native, Expo Router e TypeScript. Prioridade: jornada funcional do MVP com dados sintéticos; sem pagamentos reais, diagnóstico ou roteirização avançada.

- Lucas Operacional implementa, instala bibliotecas compatíveis com Expo Go, altera qualquer arquivo necessário do projeto, testa, faz commit/push e abre PR. Não executa merge.
- Lucas Árbitro revisa código, contratos, segurança e testes, corrige integração/infra quando necessário e faz merge após CI atual e regras nativas satisfeitas.
- Fluxo: Issue → implementação → testes → PR → revisão técnica do árbitro → CI aprovada → merge. Depois, próxima funcionalidade. Dois checkouts separados.
- Não exigir encerramento de Issues administrativas, piloto, cinco ambientes, broker, reservas distribuídas, listas de arquivos ou aprovação humana a cada alteração. Preservar dependências técnicas reais e critérios funcionais; não fechar Issues sem evidência.
- Alterações de arquitetura/contratos são permitidas: manter coerência, atualizar consumidores e testes. O arquivo/owner histórico não restringe quem pode implementar.
- Autonomia rotineira no workspace: approval_policy=never, sandbox_mode=workspace-write e rede habilitada para dependências/GitHub. Não ampliar para diretórios pessoais ou outros projetos. Full Access somente em ambiente dedicado e isolado, nunca como padrão no host.
- Exigir typecheck, lint, testes pertinentes, scanner de segredos e quality/pr-policy do SHA atual antes de merge. Manter PR obrigatório, sem exclusão/force push/bypass.
- Nunca versionar segredos, usar dados pessoais reais ou expor service_role/IA no app. Demo em memória não comprova RLS, concorrência remota, login real ou IA conectada.
- Preservar trabalho local e publicado. Antes de criar funcionalidades, conferir codex/hackathon-mvp e o PR #62; não duplicar o que já está implementado.

Leia .agents/operational.md ou .agents/arbiter.md conforme o papel. Guia curto: docs/operations/DUAL-AGENTS.md. A revisão automática é técnica e não deve ser apresentada como aprovação humana independente.
