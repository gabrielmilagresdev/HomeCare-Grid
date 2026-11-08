# Segurança

Somente dados sintéticos. Sem CPF, cartão, diagnósticos/endereço real ou payload sensível em logs. EXPO_PUBLIC_* é público; IA/service_role só no backend.

Supabase futuro: JWT verificado, RLS default deny, grants mínimos, catálogo público allowlist, mutações protegidas. Autor vem do JWT. Testar anon, owner, familiar autorizado/revogado, terceiro e profissional.

Identidades/credenciais distintas por agente. contents:write NÃO impede merge via API: exigir restrições/rulesets ou broker GitHub App que negue merge/branches protegidas a operadores. Sem enforcement, execução autônoma bloqueada. CODEOWNERS sem revisor independente não resolve.

Não reduzir proteções ou usar admin para bypass. Scanner heurístico não garante ausência de segredos. Requisitos externos em docs/operations/security-and-isolation.md.
