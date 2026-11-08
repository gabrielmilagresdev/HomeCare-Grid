# Revisão técnica retrospectiva da fundação

Auditoria técnica desta execução, base develop adb1f11ec68c736840bec41822bc97db3a276893. **Não é revisão humana independente nem aceite dos PRs #12/#55.** O autor técnico desta infraestrutura não fabrica uma aprovação retroativa.

## Evidências e conclusões

- PR #12: merge externo 6dbaa779d39635bd6525d255f72620bc01cff412, origem 548ae196840d78a010cefdc4ca827239d95a04dc. Autor real e merger registrados como gabrielmilagresdev; nenhuma revisão independente registrada. O papel lógico Lucas Operacional não cria identidade técnica separada.
- PR #55: origem e66cc5519873b8baa1d13e16be0c1910ae18b026, merge externo adb1f11ec68c736840bec41822bc97db3a276893, também sem revisão independente registrada. Código integrado não equivale a aceite #54.
- Stack existente preservada: Expo 58.0.23, React Native 0.88.1, React 19.3.0, Expo Router, TypeScript strict e versões exatas/lock. Esta entrega não altera package/lock/app.json/tsconfig nem implementa funcionalidades.
- Tipos compartilhados em src/domain/types; fronteiras externas em schemas; Result/RemoteState, UTC explícito e centavos inteiros. Parsers descartam campos extras do concierge e validam serviço/região/intervalo. Matching é determinístico e não usa LLM para autorização.
- Helper canAccessRecipient verifica owner e vínculo não revogado por ação; não substitui RLS/JWT no backend. overlaps valida UTC e intervalos semiabertos; não é exclusão concorrente de banco. data-model documenta exclusion constraint, transação, versão, idempotência e autoria JWT como implementação futura. Nenhuma migration/RLS/backend remoto foi declarado ativo.
- CI mantém permissões mínimas, checkout sem persistir token e Actions pinadas. pr-policy executa em pull_request, revalida edição e rejeita SHA obsoleto. Não foi introduzido pull_request_target nem permissão de merge no Actions.
- Configuração compartilhada Codex já tem never/workspace-write/network=false, conforme autorização explícita anterior. Arquivo local não prova confiança/carregamento em cada computador.

## Problemas reais tratados na Issue #56

| Achado | Efeito | Correção / limite |
| --- | --- | --- |
| Ausência anterior de regras nativas | PRs integrados sem gate independente | Ruleset 26781801 ativado e relido; main/develop protected:true |
| CODEOWNERS não configurado e identidades não comprovadas | Governança só documental | CODEOWNERS com Gabriel/Lucas aceitos; App do árbitro e restrição exclusiva permanecem externos |
| Promover infra nova faria a allowlist antiga de cinco arquivos recusar #52 | Falso bloqueio de preparação legítima | Lista exata adicional de infra; exige #56 aceita, #58 quando houver artefatos do piloto; MVP continua recusado |
| Locks/isolamento/executor não existentes | Risco de colisão e acesso a credenciais | Broker, SQLite transacional/fencing/quarentena, containers e harness; implantação ainda não realizada |
| Revisão de Lucas Operacional poderia usar apenas outro prompt de Lucas | Falsa independência humana | Aprovação humana de outra pessoa no SHA atual, além da análise técnica do árbitro |
| contents:write permite merge após gates | Credencial operacional não é intrinsicamente limitada a branch | Token fora do worker + broker nega merge; segundo ruleset exige App exclusivo, ainda não provisionado |
| Falta de prova real de bloqueio/recuperação | READY não demonstrado | Issue #58 e procedimento de piloto, sem fechar #17 |

Não foi encontrado ciclo de implementação no backlog canônico: #13–#16 dependem de BOOT/#2; #2 aguarda aceite/revisão e governança #17. A infra de remediação #56 não depende da implementação das Stories MVP. O piloto #58 depende da entrega #56 e produz evidências para #17; não depende de #2/#17. Assim o aceite da fundação não exige iniciar Stories antes de poder validar segurança.

#13–#16 possuem partes já entregues, mas seu aceite independente continua pendente. Não duplicar scaffold/contratos/CI para justificar status; registrar revisão e critérios satisfeitos nos próprios itens. Nenhuma Issue foi fechada ou marcada Ready nesta execução para fazer CI passar.

A revisão independente pendente deve examinar os diffs completos de #12/#55 e #57, o lock, testes, gates e limitações Expo Go. CI e export de bundle não substituem smoke em aparelho físico. Persistem: teste físico, backend remoto/RLS, containers efetivos, credenciais e todos os testes nativos de permissão. Essas lacunas impedem aceite automático, mas não justificam reescrever partes corretas do domínio.
