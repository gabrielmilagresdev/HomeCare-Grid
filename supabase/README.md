# Backend planejado

Nenhum projeto remoto criado/conectado. Catálogo sintético e ports no scaffold. Migrations, RLS, Auth e operações protegidas serão implementadas em 2.1, 4.1, 4.4 e 5.1 conforme docs/architecture.

Antes de modo remoto: publishable key apenas no cliente; JWT; migrations; RLS por recurso; RPC de reserva atômica; teste por papel e duas conexões. Edge Function do Concierge verifica sessão/entrada/saída, timeout e logs minimizados. service_role/chave IA só no backend. Modo remoto permanece indisponível até validação.
