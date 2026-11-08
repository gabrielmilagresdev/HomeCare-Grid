# Tato

**O cuidado certo, onde você está.** Aplicativo mobile Expo para aproximar pessoas com barreiras de deslocamento, profissionais independentes e famílias autorizadas.

## MVP demonstrável

A experiência local funciona sem conta e usa exclusivamente dados sintéticos. A jornada cobre busca por serviço, região, horário, acessibilidade e valor; sugestão administrativa de filtros; matching determinístico com explicação; perfil profissional; solicitação; aceite ou recusa; agenda; permissões familiares revogáveis; demanda sem cobertura com consentimento; e divisão de custos sem cobrança.

O modo local mantém o estado apenas enquanto o aplicativo está aberto. A escolha de perfil **não é autenticação real** e uma solicitação salva não chega a um profissional. Os contratos de backend, RLS e RPCs estão em `supabase/migrations/` para implantação futura; não foram aplicados nem conectados ao app. Nenhum diagnóstico, prontuário, pagamento real ou dado pessoal é tratado.

## Executar

Requer Node.js 24.11.1 ou superior na linha 24, npm e Expo Go compatível com SDK 58.

```sh
npm ci
npm start
```

Abra o QR no Expo Go. Na tela inicial, escolha **Preciso de cuidado**. A **TatinhIA** aceita texto ou voz, responde em linguagem simples e sugere filtros revisáveis; a busca compara profissionais, horários e valores. Para trocar de perfil, use **Conta** ou volte à tela inicial. Veja o [roteiro completo](docs/demo/demo-flow.md).

A identidade visual usa porcelana, tinta ameixa e citron. Os quatro retratos de profissionais são imagens geradas para perfis sintéticos; não representam pessoas cadastradas. A voz e o pagamento não estão conectados.

Para usar a **TatinhIA** com Grok e transcrição de voz, configure `XAI_API_KEY` apenas no ambiente do servidor e execute `npm run concierge:dev` antes de iniciar o Expo. O comando configura uma sessão local em `.env.local` (ignorado pelo Git). Em Android via USB, execute também `adb reverse tcp:8787 tcp:8787`; para Expo Go remoto, configure uma URL HTTPS pública para o serviço local. Sem o serviço, o texto usa filtros locais e a gravação informa que a voz está indisponível. Consulte o [guia da integração xAI](docs/operations/CONCIERGE-XAI.md) para aparelho físico, limites e privacidade.

## Qualidade local

```sh
npm run typecheck
npm run lint
npm test
npm run test:ui
npm run doctor
npm run bundle
```

Os testes de domínio cobrem elegibilidade, transições, conflitos locais, idempotência, autorização familiar, revogação, consentimento e divisão exata em centavos. A exportação de bundles Android/iOS não comprova uso em dispositivo. O teste concorrente de PostgreSQL e o smoke físico exigem ambiente externo e permanecem pendentes.

## Estrutura

- `app/`: rotas Expo Router e composição da navegação.
- `src/features/`: telas e estado da demonstração.
- `src/domain/`: tipos, parsers e regras puras.
- `src/services/demo/`: adaptadores locais e fallback administrativo do Concierge.
- `src/services/ai/` e `server/`: cliente Expo e serviço local protegido da integração xAI.
- `src/components/ui/` e `src/theme/`: identidade visual e componentes acessíveis.
- `supabase/migrations/`: schema, RLS e RPCs preparados para backend, ainda não aplicados.
- `docs/audit/mvp-implementation.md`: análise de todas as issues e PRs, entregas e limites.

O backlog original, as dependências e as regras de trabalho estão em [docs/agile/backlog.md](docs/agile/backlog.md) e [AGENTS.md](AGENTS.md). As histórias de pagamentos reais, geografia real, WhatsApp, notificações e rotas avançadas continuam pós-MVP.
