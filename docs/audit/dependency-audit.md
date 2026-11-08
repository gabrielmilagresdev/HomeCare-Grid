# Dependências e evidências

Versões diretas exatas em package.json. Versões nativas conferidas no bundledNativeModules oficial do SDK 58. A CI identificou e corrigiu peer transitivo React DOM (override 19.3.0), alinhamento Jest 30.5.2 e TypeScript 6.0.3 exigido por expo install --check.

React DOM é apenas peer transitivo do Router; não há implementação web, React DOM principal ou plataforma web em app.json. O override não usa --force/legacy-peer-deps.

A instalação da CI run 3 reportou 31 advisories: 1 baixo, 30 moderados, zero altos/críticos. Isso não significa ausência de vulnerabilidades. Precisam de triagem por pacote/caminho em #15, preservando compatibilidade Expo Go. Não aplicar npm audit fix --force nem trocar versões nativas sem revisão. O gate npm audit --audit-level=high falha para altos/críticos; moderados permanecem visíveis.

Scanner local só cobre padrões comuns de tokens/chaves/arquivos .env privados; não é auditoria completa. Sem secrets de backend no scaffold. Package lock gerado pela CI foi incorporado; a CI definitiva usa npm ci em checkout limpo.

Evidências: [run 2](https://github.com/gabrielmilagresdev/HomeCare-Grid/actions/runs/42432458748) instalação/tipos/lint/domínio; [run 3](https://github.com/gabrielmilagresdev/HomeCare-Grid/actions/runs/42432774868) também UI passou, check Expo apontou TypeScript e motivou correção.
