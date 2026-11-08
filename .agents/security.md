# Segurança essencial

Somente dados sintéticos; sem CPF, cartão, diagnósticos ou endereço real nos dados/logs. EXPO_PUBLIC_* é público; service_role e chaves de IA ficam fora do app e do Git.

Workspace autorizado, sem arquivos pessoais/outros projetos. never/workspace-write, rede habilitada para dependências e GitHub; isso não é allowlist de destinos. Full Access só em ambiente dedicado e isolado, não como padrão no host.

Lucas Operacional desenvolve; Lucas Árbitro revisa e integra com CI atual. Não usar bypass, desabilitar checks ou inventar aprovação humana. O modo de hackathon dispensa identidade técnica nova, broker e aprovação humana obrigatória; regras técnicas permanecem.

Qualquer conexão remota futura exige JWT, autorização por recurso, RLS e testes reais. Demo local, SQL escrito e testes de engine não provam backend implantado. Supabase/IA remotos ainda não conectados no MVP auditado.

Scanner e revisão técnica antes de merge; nunca publicar tokens. Preserve trabalho local, branches e histórico.
