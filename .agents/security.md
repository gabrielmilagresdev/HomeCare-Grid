# Segurança

Somente dados sintéticos. Sem CPF, cartão, diagnósticos/endereço real ou payload sensível em logs. EXPO_PUBLIC_* é público; IA/service_role só no backend.

Supabase futuro: JWT verificado, RLS default deny, grants mínimos, catálogo público allowlist, mutações protegidas. Autor vem do JWT. Testar anon, owner, familiar autorizado/revogado, terceiro e profissional.

Identidades/credenciais distintas por agente. contents:write NÃO impede merge via API: exigir restrições/rulesets ou broker GitHub App que negue merge/branches protegidas a operadores. Sem enforcement, execução autônoma bloqueada. CODEOWNERS sem revisor independente não resolve.

Não reduzir proteções ou usar admin para bypass. Scanner heurístico não garante ausência de segredos. Requisitos externos em docs/operations/security-and-isolation.md.

## DUAL_AGENT_MODE

Dois checkouts e contextos de credenciais separados, nunca edição simultânea do mesmo checkout. Cinco containers, broker distribuído e App exclusivo não são exigências arquiteturais desse modo; proteção nativa/revisão humana e negação técnica de merge operacional continuam necessárias. Se for usada a mesma conta Lucas nos dois papéis, Gabriel aprova formalmente o SHA atual. Contents:write ou um prompt proibindo merge não constituem negação técnica.

Uma allowlist de ferramentas GitHub aplicada fora do alcance do operacional, junto de comandos sem rede e sem token local, pode separar os papéis sem infraestrutura distribuída. Conferir catálogo efetivo, ausência de vias alternativas e teste negativo real antes de aceitar esse controle. Se o cliente não aplicar a restrição, manter bloqueado e usar identidade/restrição nativa ou gateway mínimo autorizado. Nunca diminuir sandbox, expor token privilegiado ou fingir que o filtro foi instalado.
