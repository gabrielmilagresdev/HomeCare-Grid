# Roteiro de demonstração — HomeCare Grid

**Ambiente:** Expo Go SDK 58, dados inteiramente fictícios, sem credenciais. O estado existe apenas durante a sessão do app. A tela inicial e o rodapé identificam a simulação.

## Jornada principal (3–4 minutos)

1. Inicie com `npm ci` e `npm start`, abra o QR em um Expo Go compatível. Na tela inicial, escolha **Preciso de cuidado**.
2. No Concierge, digite “Preciso de apoio no Centro amanhã de manhã” ou selecione **Fisioterapia**. Na busca, edite a intenção se necessário; use **Data**, **Preço** e **Mais filtros**. O adaptador offline sugere somente filtros administrativos. **Pós-operatório** sozinho pede a escolha explícita de um serviço.
3. Compare os perfis e horários reais da fixture. Em fisioterapia no Centro, **Nina Ribeiro** e **Caio Martins** aparecem com preços diferentes. Abra um perfil, selecione o horário e avance para a revisão. Confira pessoa atendida, endereço fictício completo e total demonstrativo; alterar a região pode invalidar o profissional escolhido. Toque em **Simular solicitação** para criar um pedido pendente, sem cobrança.
4. Na agenda da pessoa, observe **Aguardando aceite**. Toque no logotipo para voltar ao início e escolha **Sou profissional**. Selecione **Marina Azevedo** na lista de perfis e aceite a solicitação.
5. Volte pelo logotipo e escolha **Cuido junto com a família**. Rafa vê a agenda confirmada, mas não pode solicitar outro atendimento. A seção **FamilyPay · SIMULAÇÃO** divide o valor em centavos, sem cobrança.
6. Volte ao início e escolha **Preciso de cuidado**; abra **Ver agenda da família** a partir da agenda da pessoa. Como responsável, altere a permissão de solicitar para Rafa e, se desejar, revogue o vínculo. Ao voltar como Rafa, a agenda é negada após a revogação.
7. Na agenda da pessoa, expanda **Ver histórico** para conferir o envio e o aceite no acompanhamento administrativo.

## Cenários de recuperação

- **Sem cobertura:** em **Mais filtros**, selecione **Zona Norte**. A lista mostra o estado vazio e oferece ajuste de filtros e demanda voluntária. Abra a demanda, deixe o consentimento desmarcado e veja que o envio fica indisponível. Marque o consentimento, registre e depois revogue. O registro não contém endereço ou texto livre.
- **Limite de preço:** digite um valor como `100,50` para filtrar por hora. Uma entrada inválida exibe erro e suspende os resultados até ser corrigida ou apagada.
- **Conflito de agenda:** faça duas solicitações de Marina no mesmo horário; no papel profissional, aceite uma e tente aceitar a outra. A segunda deve informar conflito. Horários adjacentes podem coexistir.
- **Recusa:** em uma nova solicitação, use **Recusar**. A pessoa vê o estado atualizado e pode solicitar novamente, com revalidação de filtros.
- **Profissionais alternativos:** solicite Caio ou Lia onde houver cobertura. Em **Sou profissional**, selecione o mesmo nome; somente o destinatário vê e responde a solicitação.
- **Acesso negado:** tente solicitar como Rafa antes de conceder `canBook`, ou consulte a agenda após revogar o vínculo.
- **Filtros ambíguos:** selecione **Pós-operatório**. O app não escolhe uma especialidade clínica automaticamente; escolha um serviço para continuar.

## O que conferir em dispositivo

Registrar aparelho, SO, versão do Expo Go, SDK, SHA e data. Conferir navegação, contraste, fonte ampliada, leitor de tela, alvos de toque e rotação. Em 08/11/2026, a entrada, o Concierge, resultados e revisão foram inspecionados no emulador Medium_Phone_API_37.0 (Android 17/API 37, Expo Go SDK 58) em 393 dp; o Concierge também foi inspecionado em 320 dp, e a jornada até a revisão com escala de fonte 200%. O teste em aparelho físico, leitor de tela e iOS continuam **NÃO EXECUTADOS**. Bundle Android/iOS não substitui esses checks.

## Limites reais

O modo local não tem login, persistência após reiniciar ou concorrência de rede. As migrations SQL ainda não foram aplicadas em Supabase nem testadas com duas conexões PostgreSQL. O Concierge não usa IA remota; seu fallback offline nunca fornece diagnóstico. FamilyPay não processa pagamentos. Nenhuma história pós-MVP é apresentada como pronta.
