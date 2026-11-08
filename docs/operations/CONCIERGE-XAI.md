# Concierge com xAI no MVP

O aplicativo usa um serviço local de apoio para interpretar **termos administrativos** de busca. A chave xAI fica apenas no processo Node. Texto livre não é enviado à xAI: o serviço extrai uma lista fechada de serviço, região, amanhã, período e acessibilidade. Respostas são estruturadas e validadas por allowlist no servidor e novamente no app. A seleção final sempre pode ser editada.

## Iniciar

1. Configure `XAI_API_KEY` como variável de ambiente do processo servidor. Use uma chave ativa do gerenciador de segredos; não a cole no repositório, em `.env.example` ou em variáveis `EXPO_PUBLIC_*`.
2. Execute `npm run concierge:dev`. O comando cria uma credencial curta de sessão e escreve **somente** URL e credencial de acesso local em `.env.local`, ignorado pelo Git. Ele escuta em `127.0.0.1:8787` por padrão.
3. Reinicie `npm start` para que o Expo carregue `.env.local`. Em Android via USB/emulador, execute `adb reverse tcp:8787 tcp:8787`. No simulador iOS, o endereço local geralmente é acessível diretamente.
4. Para Expo Go em aparelho físico na mesma rede, defina `CONCIERGE_HOST=0.0.0.0` e `CONCIERGE_PUBLIC_URL=http://IP_DA_MAQUINA:8787` antes do passo 2. Use apenas em rede confiável. A credencial de sessão do app é visível no bundle e **não constitui autenticação de produção**.

Se o serviço estiver ausente, lento ou com cota esgotada, a busca usa o interpretador local. O app informa que aplicou filtros básicos. Nenhum agendamento ou cobrança sai do aparelho nesta versão.

## Limites e operação

- Modelo fixo: `grok-4.3`, `reasoning.effort=none`, endpoint `POST /v1/responses`, saída JSON Schema e `store=false`. A documentação oficial recomenda Responses para integrações novas: [API](https://docs.x.ai/developers/rest-api-reference/inference/responses), [saída estruturada](https://docs.x.ai/developers/model-capabilities/text/structured-outputs), [modelos](https://docs.x.ai/developers/models).
- Timeout de 8 s na xAI e 9 s no app. Máximo de 180 tokens de saída por chamada, 6 chamadas por minuto, 2 simultâneas e 60 por processo. HTTP 429, resposta inválida e falha de rede acionam fallback local.
- Logs contêm apenas modelo e contagem de tokens; não contêm texto, nomes ou credenciais. Os preços atuais devem ser verificados no [painel de preços da xAI](https://docs.x.ai/developers/pricing) antes de um piloto; o limite de chamadas acima não equivale a um teto monetário garantido.
- Para hospedar publicamente, substituir a credencial local por autenticação de usuário, autorização por pessoa/ação, rate limit persistente e orçamento na conta xAI. Não publicar o serviço local em uma URL pública.
- Uma chave compartilhada em conversa deve ser revogada e substituída antes de qualquer piloto externo. O serviço lê a nova chave do ambiente sem alteração de código.
