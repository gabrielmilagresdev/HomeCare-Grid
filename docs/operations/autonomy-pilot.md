# Piloto real — Issue #58

**Não executado nesta máquina.** Docker ausente, credenciais técnicas e provedor não provisionados. Os testes locais do broker usam GitHub/modelo simulados; não demonstram permissões reais do GitHub nem isolamento do Codex em Linux.

## Sequência controlada

1. Integrar e validar a infraestrutura #56 por revisão humana independente e árbitro autorizado. Manter #58 blocked até essa integração e os pré-requisitos de identidade/rede/container.
2. Administrador aceita/verifica as quatro identidades operacionais e um App distinto do árbitro. Ativa e relê o segundo ruleset de update exclusivo, sem bypass no ruleset de revisão/CI. Testa que um token operacional contents:write não consegue integrar PR elegível; não inferir isso da string de permissão.
3. Construir/pinar imagem por digest, preparar runtime, CODEX_HOME e proxy. Executar os probes de escrita fora do workspace, mounts pessoais, credenciais e rede. Documentar logs reais em proofs de credentials/isolatedContainers/networkIsolation, com configDigest, develop SHA e expiração.
4. Após #56 closed/completed/integration:verified e prerequisitos provados, marcar somente #58 Ready. Não marcar nenhuma Story MVP Ready. Executar `node scripts/autonomy/cli.mjs pilot .runtime/agents`. Outro ator/número é recusado. O comando não exige #2/#17 concluídas, porque produz evidências para aceitá-las.
5. O piloto modifica apenas docs/audit/autonomy-pilot-result.md e tests/autonomy-pilot.test.mjs. Para falha controlada, o teste temporário deve falhar em GitHub Actions (`process.env.GITHUB_ACTIONS === 'true'`) e passar localmente, com propósito explícito no PR. CI roda tests/autonomy*.test.mjs no job quality. Nunca alterar workflow, check de segurança ou produto para produzir o negativo.
6. Registrar PR, SHA, logs do Codex e respostas. Confirmar execução sem prompt e sem acesso indevido. O PR inicial fica Draft. Registrar tentativa de merge bloqueada pela CI, sem usar token administrativo ou bypass.
7. Humano independente registra revisão controlada; novo commit deve invalidar aprovação anterior. Aplicar mudanças solicitadas e status:changes-requested. Executar resume para a mesma Issue, corrigindo o teste temporário e documentando resultados reais. Duas execuções totais; se falhar novamente, bloquear para diagnóstico.
8. Esperar quality e pr-policy verdes no SHA atual; executar ready do ator proprietário. Solicitar/obter aprovação humana independente nesse SHA. Para autoria de Lucas Operacional em qualquer teste posterior, Gabriel deve ser o aprovador adicional.
9. Executar arbiter com número do PR: inspecionar todos os arquivos e evidências, registrar resultado. merge exige APPROVED do árbitro + aprovação humana + regras/checks atuais. Antes do merge positivo, repetir tentativa com a credencial operacional com CI/review satisfeitas: ainda deve ser negada pelo ruleset exclusivo. Só então App do árbitro pode integrar pelo caminho normal.
10. Validar branch de integração e critérios, registrar aceite #58 e integration:verified. Atualizar #17 apenas quando todos os sete critérios estiverem provados. Aceitar retrospectivamente #2/#54 e as Stories de fundação pelos responsáveis, sem reimplementar o que já está correto. A promoção #52 continua separada da release #43.
11. Registrar proofs de exclusiveArbiterRule, credentials, isolatedContainers, codexConfigLoaded, nonInteractivePilot, networkIsolation, operatorMergeDenied, failedCiBlocksMerge, independentReview, staleReviewDismissed, arbiterMergeAllowed, recoveryPilot e fullPilot. Atualizar baseSha/configDigest após a integração validada. Reiniciar broker e executar preflight. Nenhum flag pode ser true só porque os testes unitários passaram.

## Interrupção e concorrência

Os testes Node executam dois processos concorrentes no mesmo DB e verificam um único claim, prefixos/grupos, expiração, fencing e limite de tentativas. Repetir contra o broker implantado com dois controladores e o mesmo Issue; apenas um inicia container.

Durante uma execução sintética, interromper controlador/container. Esperar expiração e observar quarentena com recursos retidos. stop deve visar somente o container registrado. Confirmar execução parada e nenhum pedido de publicação em voo, reconciliar GitHub (inclusive branch criada sem PR), então recover pelo administrador. Tentar reutilizar lease/fence antigos deve falhar. Não apagar DB para contornar orçamento.

## Registro mínimo

Data/ator e login técnico real; configuração e digest da imagem; SHA-base/PR/head; regras lidas; método e status HTTP do negativo e positivo; IDs/URLs dos checks; humano aprovador/commit da aprovação; evidência de stale dismissal; logs do Codex/sandbox/rede; reserva/renovação/expiração/fencing; recuperação e validação após merge.

Nunca salvar headers Authorization, tokens, chaves privadas ou dados pessoais. Caso algum teste não possa ser feito, manter o gate falso e o veredito NOT READY — BLOCKERS REMAIN.
