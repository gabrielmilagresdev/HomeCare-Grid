# Modelo de dados v1

Há contratos TypeScript e fixtures. Não há banco remoto, migrations aplicadas, RLS ativa ou persistência de reservas. Supabase será integrado nas Stories próprias.

IDs UUID no backend, demo-* em memória. Centavos inteiros BRL. Tempo timestamptz/ISO UTC Z; exibir America/Sao_Paulo. starts_at < ends_at, intervalos [início,fim).

| Entidade MVP | Campos/relações essenciais | Acesso |
| --- | --- | --- |
| users | id=auth.uid, display_name; papéis múltiplos controlados | próprio usuário, email nunca no catálogo |
| care_recipients | id, owner_user_id FK, display_name | owner/vínculos autorizados |
| family_memberships | id, recipient_id, user_id, can_book, can_view_schedule, revoked_at opcional; unique recipient/user | owner gerencia, membro lê próprio vínculo |
| services | id, name, requires_credential | catálogo leitura, admin escrita |
| professionals | id, user_id unique, display_name, hourly_price_cents | dono altera allowlist, servidor controla credencial |
| professional_services/service_areas | professional_id + service_id/region_code unique | catálogo minimizado |
| availability_slots | id, professional_id, starts_at, ends_at | dono escreve; exposição mínima |
| care_requests | id, recipient_id, requester_user_id, service_id, region_code, intervalo, accessibility_tags, max_price_cents opcional | autor/owner/autorizados |
| bookings | id, request_id, professional_id, status, intervalo, version >=1, idempotency_key | participantes autorizados; RPC protegida |
| booking_events | id, booking_id, actor_user_id, from/to, created_at | append-only servidor |
| consent_records | id, user_id, purpose, policy_version, granted_at, revoked_at opcional | próprio usuário |
| unserved_demands | id, requester_user_id, service_id, region_code, consent_id, created_at | autor; agregado minimizado |

matches é resultado calculado sem tabela obrigatória. professional_credentials/verificação automatizada, reviews, payment_intents e Care Passport ficam fora do schema mínimo. Nunca permitir credential_status=verified por autodeclaração. SimulatedPayment é contrato em memória com mode=simulated; não processa dinheiro.

## Estados e concorrência

requested -> accepted/rejected/cancelled.
accepted -> cancelled/completed.
rejected/cancelled/completed são terminais. Outras transições proibidas. Retry idempotente retorna resultado anterior, sem novo evento.

Aceite/recusa só profissional alvo. Cancelamento por requester/owner/familiar canBook ou profissional conforme política explícita. completed só profissional após ends_at. Actor do JWT. Versão/evento na mesma transação.

Backend deve instalar btree_gist e exclusion constraint:
EXCLUDE USING gist (professional_id WITH =, tstzrange(starts_at,ends_at,'[)') WITH &&) WHERE (status='accepted').
Duas requested podem coexistir; apenas aceite ocupa horário. RPC verifica JWT, permissão, expectedVersion, disponibilidade, serviço/credencial, bloqueia linha, muda status e grava evento. SQL 23P01 -> conflict; 42501 -> unauthorized. unique(requester_user_id,idempotency_key) para criação.

Não basta SELECT antes de UPDATE. Testar duas conexões concorrentes: uma aceita e uma conflita; adjacentes são permitidas. Helpers TS não garantem banco. Retenção/eliminação e revogação de consentimento serão definidas no backend; dados reais continuam proibidos.
