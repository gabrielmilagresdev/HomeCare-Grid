# Backend preparado, ainda não conectado

As migrations em `migrations/` definem tabelas, RLS por recurso, catálogo com grants de colunas, RPCs de reserva e demanda e uma exclusion constraint PostgreSQL para horários aceitos sobrepostos. `request_booking` deriva o autor de `auth.uid()`, usa idempotência; `transition_booking` aplica versão esperada, alvo profissional, transições e eventos na mesma transação. `record_unserved_demand` exige consentimento explícito; os agregados suprimem grupos menores que cinco.

**Nenhuma migration foi aplicada.** Não há projeto Supabase, URL, publishable key, autenticação remota ou cliente de produção configurado. O app executa somente a demonstração local, e as regras TS dessa demonstração não substituem RLS nem a exclusão atômica do banco.

Antes de habilitar modo remoto, revisar as migrations num projeto dedicado, testar RLS como anônimo/owner/familiar somente leitura/familiar autorizado/revogado/terceiro/profissional e executar aceites simultâneos em duas conexões PostgreSQL, inclusive horários adjacentes. Configurar Auth e sessão Expo Go, conectar os ports, validar tratamento de SQLSTATE 23P01/42501 e executar smoke físico. Somente URL e publishable key podem estar em `EXPO_PUBLIC_*`; nunca `service_role` ou chave de IA.
