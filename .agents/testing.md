# Testes

npm test: node:test sobre domínio TS real, Node 24, sem dependências externas. test:ui: Jest/Expo + React Native Testing Library. ci/typecheck/lint/test:ui/doctor/bundle dependem de instalação.

Cobrir payload inválido, datas/fuso, matching obrigatório antes de ordenação, vazio, vínculo revogado e estados terminais. Concorrência remota exige PostgreSQL com duas conexões; helpers locais não substituem.

CI quality/pr-policy no SHA atual. Sem paths que omitam checks obrigatórios. CI/bundle não comprovam aparelho ou RLS. Smoke em docs/demo/demo-flow.md. Relatar comandos/resultados reais e limitações.
