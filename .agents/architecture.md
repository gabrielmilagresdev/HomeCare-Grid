# Arquitetura

Consultar docs/architecture/overview.md, data-model.md e access-control.md antes de contratos. ADRs em docs/adr/.

Rotas -> features -> serviços/domínio. Adaptadores -> contratos/domínio. UI -> tema. Domínio -> domínio. Não importar outra feature diretamente. Evitar microsserviços, DI genérica e estado global antecipado.

Tipos únicos, parsers allowlist para entradas externas e funções puras compartilhadas. Result<T> para erros; RemoteState<T> exige loading/empty/error/ready. Sem cast cego de payload.

Mudança de contrato exige Issue/PR, consumidores/dependências atualizados, testes e revisão arquitetural. Adições compatíveis primeiro; breaking change exige decisão do árbitro. Backend aplica autorização/concorrência sem confiar no cliente.
