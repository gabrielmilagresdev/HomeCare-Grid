# Arquitetura v1

Monólito modular mobile com um pacote Expo SDK 58, React 19.3 e RN 0.88.1. Monorepo/microsserviços aumentariam custo no hackathon de 36 h. Compatibilidade final exige install --check, doctor, bundle e smoke no Expo Go instalado.

Fluxo: rota -> feature -> port de serviço -> adaptador demo/Supabase futuro -> parser -> Result -> estado visual. IA produz filtros administrativos validados e confirmados pelo usuário; nunca diagnóstico ou escolha clínica.

| Diretório | Responsabilidade |
| --- | --- |
| app/ | Rotas/composição, sem acesso privilegiado |
| src/features/ (por Story) | Telas/casos de uso de cada capacidade |
| src/domain/types, schemas, rules | Contratos únicos, validação e regras puras |
| src/components/ui, common | Primitivas acessíveis/composição reutilizável |
| src/services/ | Ports e adaptadores |
| src/lib/ (futuro) | Clientes públicos/configuração, sem segredos |
| src/testing/, src/theme/ | Fixtures sintéticas e tokens visuais |
| supabase/ | Especificação futura, sem instância provisionada |
| .agents/, docs/ | Políticas, arquitetura, Agile e demo |
| scripts/, tests/, .github/ | Ferramentas, qualidade e integração |

Dependências: app -> feature/UI; feature -> serviço/domínio/UI; adaptador -> port/domínio; UI -> theme; domínio -> domínio. Features não importam entre si. Evitar ciclos, estado global antecipado e arquivos gigantes. Diretórios futuros só surgem com conteúdo real.

Result discrimina validation/unauthorized/not_found/conflict/network/timeout/unavailable. UI modela loading/empty/error/ready. Rede terá timeout/cancelamento; no máximo um retry de leitura idempotente; mutações exigem chave idempotente e versão esperada.

Auth futura: Supabase Auth compatível com Expo Go, sessão persistida de modo adequado e JWT validado no backend. Papéis são capacidades acumuláveis; seletor visual não autoriza acesso. Family Hub valida recurso/ação. Rotas atuais são só demonstração.

Contratos em src/domain/types/index.ts e src/services/contracts.ts; parsers em schemas. Mudanças exigem consumidores/dependências identificados, testes, revisão e migração quando aplicável.

Fontes consultadas em 07/11/2026: [SDK 58](https://docs.expo.dev/versions/v58.0.0/), [Expo Go](https://expo.dev/go), [Router](https://docs.expo.dev/router/installation/), [versões oficiais](https://raw.githubusercontent.com/expo/expo/sdk-58/packages/expo/bundledNativeModules.json).
