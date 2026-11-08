# Operação com dois agentes Lucas

Modo ativo proposto: DUAL_AGENT_MODE em .agents/mode.json. A integração da Issue #59 deve ser revisada antes de adotar estas políticas. Nenhum agente é iniciado pelos scripts diagnósticos.

## Para Lucas que já está trabalhando

Não descarte código, não recrie seu clone e não execute init/prepare sobre uma pasta em uso. Confirme na máquina dele:

```text
git branch --show-current
git log -1 --oneline
git status --short
```

A base auditada develop é adb1f11ec68c736840bec41822bc97db3a276893 e contém a fundação Expo. main está no commit inicial 104ab172c5d60bc249a75172bbc5d251a4eef363. Desenvolver no clone de develop é tecnicamente possível; integrar Stories bloqueadas é recusado pelo pr-policy. Trabalho local ainda não publicado não foi auditado nesta entrega.

Usar uma branch feature|fix|chore/<Issue>-slug baseada em develop. Não implementar tudo diretamente em develop nem juntar todas as Stories em um único PR. Se há mudanças locais, preservar os arquivos e publicar/revisar o trabalho na branch da tarefa; nunca resetar ou limpar o checkout para adequá-lo ao guia.

## Papéis e permissões

Lucas Operacional implementa/testa, cria branch/PR próprios e corrige pedidos. Uma implementação por vez; a próxima aguarda integração e validação da anterior. Lucas Árbitro lê o diff completo, verifica Issue/dependências/contratos/segurança/testes, registra APPROVED, CHANGES REQUESTED, BLOCKED ou REVIEW INCOMPLETE e integra somente com gates satisfeitos.

Os dois usam checkouts diferentes. Checkouts separados não isolam credenciais: a instância operacional deve ter ferramentas GitHub limitadas, comandos sem rede e nenhum token de merge no filesystem/ambiente. Nunca enviar tokens ao chat.

Preferir identidade técnica do árbitro diferente da autoria. Se ambos representam a mesma conta Lucas, o fluxo alternativo autorizado é: PR por Lucas → análise técnica do árbitro → aprovação formal de Gabriel (gabrielmilagresdev) no SHA atual → merge pelo árbitro depois de quality/pr-policy, conversas resolvidas e demais regras. A análise do modelo não é aprovação independente. Se o PR for de autoria real de Gabriel, Gabriel não pode ser seu aprovador; precisa de outro humano autorizado, como Lucas-Phelipe. É o user.login do PR que determina autoria, não o título do prompt.

A conta esperada para Lucas é Lucas-Phelipe, ainda não autenticada/verificada nestes dois ambientes. A conexão desta auditoria é gabrielmilagresdev. Dois prompts ou dois CODEX_HOME não provam identidades/permissões independentes.

## Controle mínimo, sem infraestrutura distribuída

Não é necessário integrar PR #57/#56/#58, instalar Docker ou provisionar cinco agentes para usar o modo dual. O código e as políticas do modo legado permanecem preservados. Permanecem necessários: proteção nativa de main/develop, revisão humana independente, um operacional por vez, sandbox e negação técnica de merge ao operacional.

O ruleset 26781801 auditado está ativo, sem bypass: PR, aprovação, última alteração aprovada, stale dismissal, conversas resolvidas, quality/pr-policy do Actions 15368, atualização estrita, bloqueio de exclusão/force push. Esta adaptação não o altera.

contents:write permite merge de um PR elegível; não basta entregá-lo ao operacional e escrever "não faça merge". Pode-se aplicar allowlist no conector/MCP do contexto operacional, fora de seu alcance de escrita, mantendo credenciais fora do shell. Autorizar apenas leitura do repo/Issues/checks, criação/atualização de branch própria, PR e execução permitida de Issues. Excluir merge, aprovação/dismiss de reviews, auto-merge, alteração de regras, Actions privilegiadas e qualquer API de escrita genérica. A proteção nativa continua bloqueando escrita direta nas branches protegidas.

A configuração MCP enabled_tools usa os nomes exatos do catálogo do servidor/cliente efetivamente instalado. Não existe filtro instalado por este repositório nos computadores dos integrantes. Administrador deve configurar o contexto, desabilitar vias alternativas de escrita (incluindo outro conector com merge e shell com token/rede) e comprovar: operador consegue branch/PR, ferramenta/rota de merge é negada, árbitro consegue merge elegível sem bypass. Se o cliente não permitir filtragem efetiva, usar restrição nativa/identidade técnica ou gateway mínimo autorizado; até lá, autonomia de merge operacional permanece bloqueada. Nenhum App, conta ou serviço foi criado nesta execução.

Referências oficiais consultadas: [política de ferramentas MCP](https://learn.chatgpt.com/docs/extend/mcp) e [configuração de projeto](https://learn.chatgpt.com/docs/config-file/config-basic). Projeto precisa ser confiável para carregar .codex/config.toml; verificar configurações efetivas, não apenas existência do arquivo.

## Workspaces existentes ou novos

Pode aproveitar o clone operacional atual, preservando tudo, e preparar apenas um segundo clone para o árbitro. Não editar simultaneamente o mesmo checkout. Conferir git status e base de ambos antes de iniciar. Configuração comum permanece approval_policy=never, sandbox_mode=workspace-write, network_access=false. Não modificar automaticamente a configuração global de ninguém.

Opcionalmente, um coordenador confiável pode criar duas pastas/perfis locais de apoio:

```text
node scripts/dual-agent.mjs init .runtime/dual-agent
node scripts/dual-agent.mjs plan
```

init apenas cria diretórios separados de workspace, CODEX_HOME e prompt, manifest com cloned=false/authenticated=false e evidência vazia; não clona nem autentica nem inicia o modelo. Recusa sobrescrita. Quando for usado esse layout novo, o comando prepare aceita HCG_CLONE_TOKEN dedicado e efêmero apenas na preparação confiável; o token não entra na URL, argumentos Git persistidos ou ambiente do Codex. Não copiar credenciais pessoais nem habilitar rede no shell do agente. Falta de token/rede deixa clones pendentes e preserva os arquivos existentes.

```text
node scripts/dual-agent.mjs prepare .runtime/dual-agent
```

Esse prepare é opcional; clones convencionais previamente autorizados também servem. Não rodar o preparador de rede dentro do agente operacional. Dependências são preparadas de forma confiável com npm ci no clone escolhido antes da execução restrita. Os scripts não são daemon, broker, lock distribuído ou prova de autenticação.

## Como iniciar

Somente depois de comprovar o contexto de ferramentas e os gates aplicáveis, abrir cada checkout em instância/contexto próprio do Codex e usar os prompts preparados. Para CLI em PowerShell, com o layout opcional:

```powershell
$env:CODEX_HOME = (Resolve-Path .runtime/dual-agent/lucas-operational/codex-home).Path
$workspace = (Resolve-Path .runtime/dual-agent/lucas-operational/workspace).Path
codex --no-daemon --strict-config --ask-for-approval never --sandbox workspace-write --cd $workspace exec --json --ephemeral "Leia AGENTS.md, .agents/dual-agent.md e a Issue elegível. Atue como Lucas Operacional. Uma tarefa por vez, sem merge."
```

No segundo terminal, com autenticação e catálogo de ferramentas do árbitro:

```powershell
$env:CODEX_HOME = (Resolve-Path .runtime/dual-agent/lucas-arbiter/codex-home).Path
$workspace = (Resolve-Path .runtime/dual-agent/lucas-arbiter/workspace).Path
codex --no-daemon --strict-config --ask-for-approval never --sandbox workspace-write --cd $workspace exec --json --ephemeral "Leia AGENTS.md, .agents/dual-agent.md e .agents/arbiter.md. Revise o PR no SHA atual. Exija CI e aprovação humana independente antes de integrar."
```

No Linux, export CODEX_HOME para o diretório correspondente e usar os mesmos argumentos CLI. Para clones existentes, substituir apenas os caminhos e preservar o contexto já autenticado de cada papel. Autenticação do modelo e conector deve ser feita pelo responsável no contexto correto; não copiar arquivos de auth globais. Estes comandos não foram usados para iniciar agentes nesta entrega.

## Fila e dependências

```text
node scripts/dual-agent.mjs plan
node scripts/dual-agent.mjs queue issues-atualizadas.json
node scripts/dual-agent.mjs check .runtime/dual-agent issues-atualizadas.json
node --test tests/dual-agent.test.mjs tests/pr-policy.test.mjs
```

O snapshot é uma lista JSON de Issues obtida pela conexão autorizada. queue/check são diagnósticos; reler o GitHub no momento de reservar e antes do PR. Não tratá-los como lock. Com apenas um operacional autorizado, o coordenador registra a reserva explícita na Issue e impede uma segunda instância de implementação.

A fila prioriza fundação aceita, design system/navegação, fixtures/catálogo, papéis, marketplace, concierge, match, solicitação/aceite, Family Hub, Grid Demand e integração/demo. Respeita as dependências reais: #20 navegação exige #19 autorização; #26 marketplace exige #25 Smart Match. A ordem não retira essas dependências para antecipar telas. Continuidade avançada, agregações e FamilyPay simulado ficam depois do fluxo principal; F.* (pagamentos reais, diagnóstico/recursos fora de escopo e roteirização avançada) não entram na fila.

Antes do MVP, #2/#17 e os aceites de fundação #13–#16 precisam de evidências. Partes já implementadas são aceitas por revisão/testes, sem refazer o scaffold. Nenhuma Issue é fechada ou marcada Ready pela redistribuição. Em cada Story: contratos únicos, segurança, testes pertinentes e critérios originais preservados. Release #43 mantém #41/#42; promoção inicial #52 continua separada e bloqueada enquanto seu aceite faltar.

O script legado github-sync --apply é bloqueado no modo dual para não regenerar corpos e apagar aceites/atribuições atuais; atualizar apenas o bloco de executor das Issues. O modo legado continua disponível no histórico.

## Estado e parada

readiness exige provas atuais de workspaces, confiança/configuração, modelo/conector autenticados, negação de merge, proteção/CI/revisão independente e sandbox. Os arquivos de evidência são atestados do coordenador, não prova produzida por preencher flags. Sem prova, manter NOT READY.

Não existe executor noturno ativo. Parar a instância Codex correspondente (Ctrl+C na CLI), salvar checkpoint por Issue com branch/SHA/arquivos/testes/PR/pendências, conferir git status e reconciliar a reserva antes de retomar. Nenhum reset/clean ou alteração do trabalho de Lucas é necessário para adotar estas instruções.
