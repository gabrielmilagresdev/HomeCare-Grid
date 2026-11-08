# Simplificação urgente do hackathon — 08/11/2026

Trabalho anterior aproveitado: Issue #59, branch chore/59-dual-agent-mode e PR #60. Sem reset/clean, force push, recriação de projeto ou descarte de alterações locais. A correção reduz a governança anterior; não cria orquestrador.

## Alterações

Dois papéis: Lucas Operacional pode alterar qualquer arquivo, dependência, arquitetura/contrato e configuração coerente com Expo Go; Lucas Árbitro revisa/testa, corrige integração/infra e integra com checks atuais. Rotinas não exigem autorização por decisão.

Retirados dos gates: fechamento administrativo de fundação, status intermediários, listas de arquivos, aprovação humana, Code Owners/último push, cinco ambientes, broker, reservas e piloto. Backlog preserva originalDependsOn e dependências técnicas; não foram inventados aceites nem fechadas Stories.

Configuração de comandos: never/workspace-write e rede habilitada para dependências/GitHub, sem Full Access no host e sem novos diretórios pessoais autorizados. A política gerenciada da sessão atual não é alterada pelo arquivo.

## GitHub

Ruleset 26781801 foi temporariamente alterado após autorização e confirmação administrativa do usuário. A API confirmou approvals=0, Code Owners=false, last push=false e approval extra=false. Permanecem PR, quality/pr-policy, atualização estrita, conversas resolvidas, sem exclusão/force push/bypass. Backup e payload de restauração em docs/operations/ruleset-hackathon.json.

pr-policy passa a validar rastreabilidade, metadados/SHA atuais, destino e bloqueios técnicos explicitamente declarados. Não consulta estados de encerramento do backlog como condição de merge; a qualidade do código continua no job quality e na revisão técnica. Não representa análise automática como aprovação humana independente.

## Trabalho existente de Lucas

codex/hackathon-mvp em b244face4a8a21301198f13d3b29911e45bf519e, autoria Lucas-Phelipe, está um commit à frente de develop (adb1f11), com mudanças em 34 arquivos. Foi preservado e aberto como PR #62 para integrar/revisar o trabalho publicado, sem duplicar funcionalidades.

Há demo local de navegação por papéis, visual, marketplace/perfis, concierge offline, matching, solicitações/aceite, confirmação/agenda familiar e Grid Demand. Partes relevantes das Stories #18–#41 já têm código. Isso não prova integralmente seus critérios.

Snapshot local teve 90 arquivos conferidos por hash contra o GitHub; o lock original completo foi usado pela CI remota. Os 28 testes Node do MVP passaram aqui. No SHA original, o job quality completo passou na CI do PR #62; somente o pr-policy legado falhou pelos estados/dependências administrativos. Não houve falha de compilação do app nessa execução.

Limites reais: demo sintética em memória; autenticação remota, backend Supabase/migrations/RLS, concorrência PostgreSQL com duas conexões e endpoint de IA não estão conectados/validados. SQL foi lido como artefato ainda não implantado, sem aplicação em banco. O relato de smoke em emulador consta na auditoria de Lucas; aparelho físico e leitor de tela não foram testados por esta correção.

## Integração

O árbitro deve concluir revisão/checks atuais do PR #60, integrar a política e sincronizar normalmente a branch do PR #62 com develop, sem perder commits. Depois exigir quality e pr-policy no SHA atualizado e integrar o MVP quando tecnicamente aprovado. Nenhum merge com check falhando é autorizado.

Não há novo bloqueio administrativo para começar a desenvolver. A autenticação já usada por Lucas para publicar pode ser aproveitada; usar outro checkout para o árbitro. A separação de papéis é regra do fluxo, não uma alegação de isolamento técnico de uma mesma credencial GitHub.

Início e comandos: docs/operations/DUAL-AGENTS.md. Após o hackathon, restaurar as exigências humanas pelo snapshot preservado.
