# ADR 0001 — mobile modular e demo primeiro

Status: proposta implementada no bootstrap; aguarda revisão independente.

Um pacote Expo Go modular reduz coordenação no hackathon. Domínio puro e ports permitem demo sintética sem credenciais e backend posterior. Sem web, build nativo customizado, microsserviços ou estado global antecipado.

Consequência: Supabase é planejado, sem RLS ou concorrência remota ativas. Fluxos persistentes bloqueados até migrations/testes reais. Matching administrativo ordena preço e desempata ID; não mede qualidade clínica.

Alternativas rejeitadas: monorepo (custo agora), backend obrigatório no bootstrap (bloqueia trabalho), ranking LLM (não determinístico). Rever por necessidade concreta.
