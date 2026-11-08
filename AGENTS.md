# HomeCare Grid — entrada dos agentes

App mobile Expo Go SDK 58, React Native, Expo Router e TypeScript strict. Dados sintéticos. Sem web, diagnóstico, prontuário ou pagamentos reais.

Modo ativo em `.agents/mode.json`: `DUAL_AGENT_MODE`. Lucas Operacional executa uma Story MVP por vez; Lucas Árbitro revisa. Leia `.agents/dual-agent.md` para a regra de execução atual. Políticas de arquitetura, segurança, aceite e o histórico multiagente continuam preservados.

Antes de trabalhar leia `.agents/workflow.md`, `.agents/operational.md` e a Issue. Consulte product para escopo, architecture para contratos, ownership para coordenação, security para permissões, testing e definition-of-done para qualidade. Só o árbitro segue arbiter.md.

- Tipos únicos em src/domain/types/index.ts; entradas externas em schemas; regras compartilhadas em rules. Nunca duplicar contratos ou alterar silenciosamente.
- app compõe rotas, features encapsulam capacidades, serviços implementam ports. Domínio não importa React, Expo ou clientes externos.
- Uma Issue com dependências integradas, branch própria a partir de develop e workspace exclusivo por operador. Nunca editar working tree compartilhado.
- Operadores Gabriel, Lucas, Julio e Matheus não fazem merge nem escrevem main/develop. Credenciais e permissões dos papéis devem ser separadas. No modo legado, identidades técnicas distintas; no DUAL_AGENT_MODE, eventual uso da mesma conta Lucas exige aprovação humana independente de Gabriel, além da revisão técnica do árbitro e negação efetiva de merge ao operacional. Sem revisão independente, bloquear merge.
- Árbitro inspeciona Issue, diff completo, contratos, segurança, testes e CI no SHA atual; nenhum bypass.
- Serializar package/lock, app.json, tsconfig, layout global, domínio, migrations, CI e políticas; reserva explícita na Issue/PR.
- Sem segredos, chaves privadas em EXPO_PUBLIC_* ou dados reais. IA só produz filtros administrativos validados. Família só acessa recursos autorizados.
- Agenda remota exige autorização e exclusão atômica de sobreposição no backend; helpers TS não são barreira de concorrência.
- Checks: npm ci; npm run typecheck; npm run lint; npm test; npm run test:ui; npm run check:foundation; npm run check:secrets; npm run doctor; npm run bundle.
- Nunca declarar teste/recurso/proteção sem evidência. Stories dependentes só iniciam após fundação integrada.
- Sandbox bloqueou? Registrar impedimento sem escapar. Até duas tentativas corretivas por falha, checkpoint em até 90 min.

DoD: aceite demonstrado, testes proporcionais, CI atual aprovada, contratos revisados, acessibilidade, segurança e revisão independente. Issue fecha somente após integração validada.
