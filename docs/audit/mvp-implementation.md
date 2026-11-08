# Auditoria local do repositório e entrega do MVP — 08/11/2026

Base analisada: `origin/develop` em `adb1f11`; `origin/main` permanece no commit inicial `104ab17`. A branch `codex/hackathon-mvp`, criada a partir de `develop`, foi publicada no GitHub. Nada foi integrado em `develop/main` ou aplicado em banco.

No inventário inicial havia **55 issues abertas** e **4 pull requests**; posteriormente foi aberto o PR #60 de governança dual. O backlog original classifica dez epics, 31 stories MVP, oito histórias pós-MVP, o bootstrap #2 e cinco tarefas posteriores de governança. Os rótulos `blocked` e as dependências remotas não foram alterados por esta branch. A implementação abaixo é evidência de código, não aceite ou fechamento das issues.

## Todas as issues

| Issue | Tema | Análise e estado após este trabalho local |
| --- | --- | --- |
| #1 | Foundation & Governance | Epic; fundação em `develop`, governança externa pendente. |
| #2 | Bootstrap Expo | Integrado via PR #12 em `develop`; aceite remoto ainda aberto. |
| #3 | Design System & Navegação | Epic; experiência visual local ampliada. |
| #4 | Authentication & User Roles | Epic; demonstração por papéis, Auth remoto pendente. |
| #5 | Marketplace & Discovery | Epic; jornada local implementada. |
| #6 | Bookings & Professional Workflow | Epic; demo e SQL local, backend ainda não implantado. |
| #7 | Family Hub & Continuity | Epic; demo e RLS local, banco não validado. |
| #8 | Grid Demand | Epic; demo e RPC local, banco não validado. |
| #9 | FamilyPay Demonstrativo | Epic; divisão simulada implementada. |
| #10 | Quality, Integration & Demo | Epic; checks locais, release remoto pendente. |
| #11 | Post-MVP | Epic; preservado no backlog futuro. |
| #13 | Expo e TypeScript | Scaffold em `develop`; export Android/iOS local aprovado. |
| #14 | Arquitetura e contratos | Tipos únicos, parsers e ports da base preservados; regras locais ampliadas. |
| #15 | Qualidade e Actions | CI existente analisada; checks locais executados. A branch do MVP ainda não tem PR e não disparou a CI de PR. |
| #16 | Políticas e isolamento | `.agents` lidos; infraestrutura real de agentes não provisionada. |
| #17 | Proteções e gate de merge | Exige prova de enforcement e identidade independente; nenhuma mudança remota autorizada. |
| #18 | Tema e componentes | Tokens, botão, campos, cartões, chips, badges, estados e identidade visual locais. |
| #19 | Papéis e autorização | Regras de owner/vínculo ativo por ação na demo; RLS escrita, não aplicada/testada. |
| #20 | Navegação por papel | Rotas de pessoa, profissional e família; acesso restrito nas telas privadas da demo. Auth real pendente. |
| #21 | Estados e acessibilidade | Vazios, erros, recuperação, labels e alvos de toque; smoke com leitor de tela ainda pendente. |
| #22 | Auth Expo Go | Demo separada e explícita; login/logout/JWT remoto não implementados por ausência de projeto/credenciais e proibição de alterações remotas. |
| #23 | Fixtures | Cenários fictícios com datas relativas, sessões por papel e dados isolados. |
| #24 | Catálogo e perfis | Serviços, catálogo, perfil profissional, região, valor e estado de credencial claramente fictício. |
| #25 | Smart Match | Hard filters e ordenação determinística preservados; explicação exibida. |
| #26 | Listagem, filtros e busca | Serviço, região, horário, acessibilidade, teto de valor e nome; estado sem cobertura. |
| #27 | AI Care Concierge | Fallback offline administrativo e parser allowlist; endpoint de IA protegido não conectado. |
| #28 | Backend de reservas | Engine de demo e RPC SQL com ator JWT, versão, idempotência e evento; migration não aplicada. |
| #29 | Solicitação da pessoa | Revisão, confirmação, envio idempotente e agenda na demo. |
| #30 | Aceite/recusa profissional | Ações do alvo com versão esperada e conflito exibido na demo. |
| #31 | Concorrência da agenda | Exclusion constraint SQL e teste local de sobreposição; teste real com duas conexões pendente. |
| #32 | Vínculos familiares | Owner concede/revoga `canBook` e `canViewSchedule` na demo; políticas RLS locais não validadas. |
| #33 | Agenda compartilhada | Consulta autorizada, fuso de São Paulo, estados vazios e revogação imediata na demo. |
| #34 | Jornada integrada | Pessoa → match → solicitação → profissional → família disponível na demo; banco remoto não integrado. |
| #35 | Continuidade | Nova solicitação reutiliza filtros administrativos e revalida permissão/disponibilidade. |
| #36 | Demanda não atendida | Registro mínimo e consentimento explícito na demo; RPC SQL não aplicada. |
| #37 | Interface sem cobertura | Opt-in desmarcado por padrão, recusa e retorno à busca. |
| #38 | Oportunidades agregadas | Projeção sintética sem IDs e grupos <5 ocultos; função SQL local, sem prova real de privacidade. |
| #39 | FamilyPay | Divisão exata em centavos com rótulo SIMULAÇÃO; sem provedor/cartão. |
| #40 | Compatibilidade Expo Go | Bundle Android/iOS, Expo Doctor e jornada em emulador Android locais; aparelho físico não testado. |
| #41 | Documentação e demo | README e roteiro atualizados com passos e limites reais. |
| #42 | Auditoria de PRs | Cinco PRs inventariados abaixo; a branch do MVP segue sem PR/revisão independente. |
| #43 | Release candidata | Não aberta/integrada: requer revisão, CI e autorização remota. |
| #44 | Grid Routes avançado | Pós-MVP, fora do recorte do hackathon. |
| #45 | Care Passport completo | Pós-MVP; prontuário/escopo clínico não introduzidos. |
| #46 | Pagamentos reais | Pós-MVP; nenhuma cobrança implementada. |
| #47 | Verificação automatizada | Pós-MVP; status de credencial da demo é sintético. |
| #48 | WhatsApp | Pós-MVP. |
| #49 | Notificações reais | Pós-MVP. |
| #50 | Recorrência avançada | Pós-MVP; apenas nova solicitação manual. |
| #51 | Geografia real | Pós-MVP; regiões DEMO sem localização real. |
| #53 | Promover fundação para main | Bloqueada; PR #52 continua aberto, nenhuma promoção local/remota. |
| #54 | Elegibilidade de PRs na CI | Correções já integradas via PR #55; política local analisada, aceite remoto ainda aberto. |
| #56 | Executor isolado e broker | PR #57 aberto, código em branch separada; não integrado ao MVP local. |
| #58 | Piloto isolado e gates reais | Bloqueado por App/identidades/host e prova externa; não executado. |
| #59 | DUAL_AGENT_MODE | PR #60 aberto para `develop`, ainda não integrado. O código do aplicativo desta branch não depende de sua integração para a demonstração local. |

## Pull requests

| PR | Estado observado | Análise |
| --- | --- | --- |
| #12 | Integrado em `develop` | Fundação Expo, contratos, governança e backlog presentes na base. A documentação da PR #57 registra ausência de revisão independente anterior; não retrocedi nem simulei aprovação. |
| #55 | Integrado em `develop` | Corrige política de elegibilidade/revalidação de PR. Código está na base local; testes de política devem ser conferidos separadamente dos testes de domínio. |
| #52 | Aberto para `main` | Promoção inicial da fundação, vinculada à #53. `main` ainda é o commit inicial; dependências e revisão impedem aceite. Não integrar como release do MVP. |
| #57 | Aberto para `develop` | Adiciona broker, isolamento, leases e políticas de autonomia (27 arquivos no diff local). A própria entrega declara `NOT READY`: App exclusivo, restrição nativa, Docker/host, credenciais e piloto #58 ainda faltam. Nenhuma aprovação formal ou merge foi feita. |
| #60 | Aberto para `develop` | Adapta governança para dois papéis de Lucas. Diff de 18 arquivos sem sobreposição com o código do MVP; análise técnica local e checks do SHA `eb1b374` aprovados, com integração pendente de aceite/revisão humana. |

## Evidências e limites

- O modo demo executa sem `.env`; é uma simulação em memória, não um serviço de saúde operacional.
- Smoke visual local em emulador **Medium_Phone_API_37.0**, Android 17/API 37, Expo Go 58.0.5: entrada, busca, perfil, solicitação, aceite profissional e agenda familiar confirmada. Os screenshots ficam apenas em `.runtime/` (ignorado pelo Git). Isso não equivale a teste em aparelho físico nem a auditoria de acessibilidade com leitor de tela.
- Os testes locais verificam domínio e fluxo sintético, mas não segurança de uma instância remota. O SQL foi escrito para revisão e aplicação futura, sem afirmar RLS ou transações verificadas.
- O dispositivo Expo Go, o banco PostgreSQL concorrente, a CI no SHA remoto, a revisão humana independente e os gates de governança exigem ações/ambientes que não foram autorizados ou disponibilizados nesta tarefa.
- `main`, `develop`, labels, issues, PRs e configurações do GitHub permanecem sem alterações por esta branch; somente `codex/hackathon-mvp` foi publicada. O PR do MVP exige reempacotar as Stories em branches rastreáveis por Issue ou uma decisão explícita de governança sobre esta entrega agrupada.
