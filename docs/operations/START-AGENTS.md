# Iniciar agentes — HomeCare Grid

Estado desta entrega: **NOT READY — BLOCKERS REMAIN**. Nenhum dos cinco agentes está ativo. Docker, identidade técnica do árbitro, credenciais segregadas, provedor e piloto real ainda não foram comprovados. Não executar quatro agentes antes da Issue #58.

## Arquitetura e limites

Estratégia A: Codex executa comandos com workspace-write, approval_policy=never e network_access=false. O broker confiável possui as cinco credenciais GitHub e uma chave de provedor, identifica o ator e expõe apenas operações autorizadas. O worker recebe uma chave distinta de proxy do modelo, sem acesso às rotas de controle/administração. O preparador confiável instala dependências separadamente, sem credenciais GitHub/modelo.

Um único host dedicado executa o broker e seu SQLite em disco local, com backup de DB/WAL coerente e acesso exclusivo do coordenador. Todos os controladores consultam esse mesmo broker; arquivos SQLite locais por integrante ou SQLite em NFS não são suportados. Containers de tarefa são descartáveis, com checkout, cache/node_modules, temporários, logs e CODEX_HOME próprios. Worktree não é isolamento. Não há socket Docker, pasta pessoal, SSH ou outro projeto nos workers.

A rede hcg-workers é interna e só conecta workers ao broker; hcg-build permite saída ao broker e à etapa confiável npm ci. O broker encaminha apenas GitHub do repositório fixo e OpenAI Responses. Isso ainda precisa de teste real com Docker/Codex; não é prova de uma allowlist de comandos no host. Nunca usar danger-full-access, --privileged ou rede host para resolver um bloqueio.

## Preparação, Windows e Linux

Use um host dedicado com Docker Linux e Git, Node 24.11.1 e acesso autorizado ao repositório. Os comandos Node abaixo são iguais em PowerShell e Linux. Não instalam nem modificam o Codex global dos integrantes.

Clone pelo método de autenticação escolhido pelo administrador, sem inserir tokens na URL:

```text
git clone https://github.com/gabrielmilagresdev/HomeCare-Grid.git homecare-grid
cd homecare-grid
git switch develop
node scripts/autonomy/cli.mjs init .runtime/agents
node scripts/autonomy/cli.mjs verify .runtime/agents
node scripts/autonomy/cli.mjs dry-run .runtime/agents
node --test tests/autonomy.test.mjs tests/pr-policy.test.mjs
```

Use a versão de develop que contenha esta infraestrutura após integração revisada. init cria cinco diretórios/perfis e chaves aleatórias locais, sem rede e sem ativar agentes. Recusa sobrescrever um runtime existente. verify/dry-run consultam Docker e validam configuração/evidências; saída 2 significa NOT READY. O runtime é ignorado por Git. Em Linux, mantenha-o exclusivo do usuário coordenador, UID 1000 usado pelos containers. No Windows, configure ACL NTFS equivalente e valide mounts/UID no Docker Desktop; isso não foi validado nesta máquina.

Edite apenas .runtime/agents/config.json: modelo disponível na conta, cinco logins técnicos verificados, envs de credenciais, App do árbitro e IDs dos rulesets. Não coloque segredos nesse arquivo. A configuração inicial tem árbitro/modelo nulos de propósito.

O administrador fornece ao broker, em arquivo de ambiente fora do repositório ou secret manager, HCG_OPENAI_KEY e as cinco variáveis HCG_GH_*_TOKEN indicadas no exemplo. Alternativa GitHub App: cada ator pode ter app={id,installationId,privateKeyEnv}; a chave privada existe somente no broker e gera installation tokens limitados ao repositório. Não reutilizar a mesma credencial/identidade. App logins exigem prova do autor real de publicação; o nome configurado não basta. Nenhum token vai para prompts, logs, workers ou arquivos versionados.

Prepare a imagem no host dedicado:

```text
docker build -f infra/autonomy/Dockerfile -t homecare-grid-worker:validated .
docker image inspect homecare-grid-worker:validated
```

O Dockerfile usa a versão Codex observada 0.166.0-alpha.6; instalação/build não foram executados aqui. Se essa versão não estiver disponível, pare e revise/pine uma versão disponível; não ampliar privilégios. Publique em registry autorizado ou obtenha RepoDigest e configure workerImage como imagem@sha256:... após validar imagem e CLI. Imagem só com tag não libera preflight. .dockerignore restringe o contexto aos scripts/infra, excluindo runtime e segredos.

Depois de preencher config, regenere os CODEX_HOME isolados:

```text
node scripts/autonomy/cli.mjs profiles .runtime/agents
```

O perfil fica no CODEX_HOME exclusivo do container porque parâmetros de autenticação/provider não devem depender de configuração de projeto. .codex/config.toml continua compartilhado, com never/workspace-write/network=false, sem mudança global. Para uso interativo por um integrante: abrir somente este clone no Codex, marcar confiável conscientemente, inspecionar as permissões efetivas e usar o procedimento de teste abaixo. A confiança/configuração efetiva não foi demonstrada em outras máquinas.

## Gates nativos e identidade do árbitro

Ruleset 26781801 já está ativo para main/develop: PR, aprovação, Code Owners, stale dismissal, última alteração aprovada, conversas resolvidas, quality/pr-policy do GitHub Actions (15368), branch atualizada, sem bypass, sem exclusão/force push.

Isso ainda permite que uma identidade write integre um PR que satisfaça os gates. contents:write não distingue criação de branch de merge. Os workers não recebem esse token e o broker nega merge operacional, mas a exclusividade nativa requer um segundo ruleset, após provisionar o App do árbitro:

- Mesmo alvo main/develop; regra única update (restrição de atualizações).
- Único bypass: Integration, ID do App do árbitro, modo pull_request.
- Nenhum bypass no ruleset 26781801 de revisão/CI. O segundo ruleset não deve liberar os gates do primeiro.
- Configurar exclusiveRulesetId e arbiterAppId. Readback e tentativa negativa real devem comprovar o efeito. Se o GitHub não oferecer o modo esperado, manter bloqueado e registrar a limitação.

Não ativar restrição update sem um ator válido: isso bloquearia integrações legítimas. O executor recusa piloto e execução geral sem essa restrição. Não criar contas, mudar plano/visibilidade ou conceder Administration aos operadores.

Gabriel e Lucas-Phelipe possuem acesso aceito; Julio e Matheus tinham convites pendentes na auditoria. O CODEOWNERS proposto usa apenas os dois colaboradores aceitos com write. Em PR de Lucas Operacional, Lucas Árbitro/modelo não substitui aprovação humana independente de Gabriel.

## Broker, comprovação e piloto

No PowerShell do coordenador:

```powershell
$env:HCG_RUNTIME_ROOT = (Resolve-Path .runtime/agents).Path
$env:HCG_BROKER_ENV_FILE = 'D:\Segredos\homecare-broker.env'
docker compose -f infra/autonomy/compose.yml up --build -d broker
```

Em Linux:

```sh
export HCG_RUNTIME_ROOT="$(realpath .runtime/agents)"
export HCG_BROKER_ENV_FILE="/secure/homecare-broker.env"
docker compose -f infra/autonomy/compose.yml up --build -d broker
```

Esses caminhos são exemplos; criar/proteger o arquivo local de segredos é responsabilidade do administrador. O compose publica o controle somente em 127.0.0.1. Para controladores em outras máquinas, usar túnel privado autenticado/TLS para o mesmo broker; nunca expor a porta à Internet. Não duplicar o DB.

O broker pode servir diagnóstico sem liberar trabalho. Sem cinco credenciais, a inicialização falha antes de aceitar trabalho. Preflight geral exige #2/#17 closed/completed/integration:verified, proteções e todas as evidências. Antes disso, existe somente o comando piloto, limitado a Gabriel/#58 e a dois caminhos fixos, após #56 aceita e os pré-requisitos de identidade/rede/container provados.

Preencher evidence.json somente com resultados reais, referências de logs/URLs/SHAs e expiração. configDigest é SHA-256 de JSON.stringify(config), calculável com digest exportado por cli.mjs; baseSha deve ser o develop atual. As chaves em gates correspondem a READINESS_GATES em policy.mjs. Alteração da base invalida readiness até reconciliação e reinício; mudança do harness/imagem/identidades exige repetir os testes afetados. Arquivo de evidência não é acessível aos workers. Flags true sem provas não são aceite.

Siga [autonomy-pilot.md](autonomy-pilot.md). Só depois do piloto completo, revisão humana e aceitação legítima da fundação:

```text
node scripts/autonomy/cli.mjs preflight .runtime/agents
node scripts/autonomy/cli.mjs tasks .runtime/agents gabriel-operational
node scripts/autonomy/cli.mjs start .runtime/agents gabriel-operational 18
node scripts/autonomy/cli.mjs start .runtime/agents lucas-operational 19
node scripts/autonomy/cli.mjs start .runtime/agents julio-operational 24
node scripts/autonomy/cli.mjs start .runtime/agents matheus-operational 23
```

As Issues acima são candidatas bloqueadas, não autorizações atuais. Sem número, start seleciona a primeira tarefa canônica elegível do próprio ator; se não houver, retorna idle. As reservas serializam domínio, package/lock, configurações, layout, backend, CI e governança; escopos amplos também conflitam. A tarefa e o SHA-base ficam vinculados à lease; edição posterior da Issue bloqueia publicação.

O executor prepara um snapshot imutável autorizado do GitHub, cria baseline Git local sintética e instala dependências no container confiável. A publicação usa o SHA remoto real como pai, nunca a baseline sintética. Cada execução recebe diretório próprio. Mudanças fora do escopo, arquivos binários/renomes/exclusões exigem tratamento manual; o publicador atual aceita somente texto regular. Isso é uma limitação intencional desta primeira versão.

## Revisão, correção e conclusão

```text
node scripts/autonomy/cli.mjs status .runtime/agents lucas-arbiter
node scripts/autonomy/cli.mjs ready .runtime/agents gabriel-operational 18
node scripts/autonomy/cli.mjs queue .runtime/agents lucas-arbiter
node scripts/autonomy/cli.mjs arbiter .runtime/agents 60
node scripts/autonomy/cli.mjs merge .runtime/agents 60 SHA_ATUAL_DE_40_HEXADECIMAIS
```

60 é apenas exemplo de número de PR. ready somente remove Draft do PR próprio com CI atual aprovada. arbiter sem número seleciona o primeiro candidato. O agente recebe conteúdo completo antes/depois e registra APPROVED/CHANGES REQUESTED/BLOCKED/REVIEW INCOMPLETE vinculado ao SHA. Conteúdo indisponível/binário/limites excedidos bloqueiam análise automática. merge exige análise APPROVED vigente, humano independente no SHA atual, política de Issue/dependências, checks e gates nativos. Não aprova em nome de humanos.

Havendo mudanças solicitadas, registrar findings no PR/Issue e aplicar status:changes-requested; então:

```text
node scripts/autonomy/cli.mjs resume .runtime/agents gabriel-operational 18
```

resume usa o PR próprio aberto e seu head como base, novo workspace/lease/fence e limite total de duas execuções por Issue. Sem mudanças solicitadas não retoma. Falha de rede/publicação parcial não vira retry cego: mantém bloqueio para reconciliação remota. O executor é por execução/PR, com comandos de fila; não há daemon noturno implantado nem liberação automática irrestrita de dependências. Uma implantação agendada futura deve manter esses limites e aguardar revisão humana assíncrona.

Após merge pelo árbitro, validar CI de integração e critérios. Somente o responsável autorizado registra o aceite, fecha completed e adiciona integration:verified. Depois complete libera os recursos:

```text
node scripts/autonomy/cli.mjs complete .runtime/agents 18
```

## Parada e recuperação

```text
node scripts/autonomy/cli.mjs stop .runtime/agents
node scripts/autonomy/cli.mjs status .runtime/agents lucas-arbiter
```

stop percorre apenas os nomes hcg registrados nos checkpoints e chama docker stop, sem matar outros containers. Interrompa também os controladores em seus terminais para impedir novas invocações e pare o broker após concluir a reconciliação. Não há loop automático ativo nesta entrega.

Lease de 180 s, renovação a cada 60 s. Sem renovação, quarentena; recursos não ficam livres. Cancelar não prova parada do daemon Docker. Confirmar docker inspect, inexistência de processos/controladores/in-flight no broker e situação da branch/PR antes de recuperar. JSON de atestação administrativa:

```json
{"executionStopped":true,"remoteReconciled":true,"reason":"Container inspecionado, controlador parado, broker sem publicação pendente e branch/PR reconciliados; evidências em ..."}
```

```text
node scripts/autonomy/cli.mjs recover .runtime/agents 18 reconciliacao.json
```

A credencial admin do coordenador é distinta das chaves dos atores. Não é entregue ao worker. Timeout não libera recursos sozinho. Tentativas e eventos persistem no SQLite, mesmo com reinício. Logs por ator/lease, checkpoint atômico, limite de saída 10 MiB, quota de 60 chamadas de modelo por lease e 90 min por execução. Falhas de instalação/rede/modelo/CI não ampliam sandbox nem criam loops de retry.

## Validação local de confiança e permissões

Em cada ambiente isolado, capturar a versão Codex e a configuração efetiva pelo diagnóstico da versão instalada. Conferir projeto confiável, never/workspace-write/network=false e CODEX_HOME dedicado. Executar uma tarefa sintética que escreva somente no workspace sem pedir confirmação; tentar gravar fora dele, acessar HOME/SSH/outro projeto e fazer rede por comando: todos devem ser negados. Não usar dados pessoais nesse teste.

Validar que a chave de modelo não chama /control ou /admin, que o worker não possui token GitHub, que o controle operacional não chama merge e que a própria credencial GitHub operacional recebe recusa nativa para integrar um PR já aprovado/verde. Validar então o caminho positivo com o App do árbitro. URLs e comandos exatos da API de merge pertencem ao procedimento controlado do administrador, com o SHA do PR de piloto e sem bypass.

Referências consultadas: [execução não interativa](https://learn.chatgpt.com/docs/non-interactive-mode), [configuração avançada](https://learn.chatgpt.com/docs/config-file/config-advanced), [referência de configuração](https://learn.chatgpt.com/docs/config-file/config-reference). A existência de um TOML não comprova carregamento efetivo; só o piloto produz essa evidência.
