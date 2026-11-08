# Autorização por recurso

| Ação | Owner/pessoa | Familiar | Profissional alvo | Terceiro/anon |
| --- | --- | --- | --- | --- |
| Catálogo minimizado | sim | sim | sim | leitura pública allowlist |
| Agenda da pessoa | sim | vínculo ativo + canViewSchedule | apenas próprias reservas | negar |
| Criar/cancelar pedido | sim | vínculo ativo + canBook | só cancelar própria reserva | negar |
| Aceitar/recusar | não | não | sim, status/disponibilidade válidos | negar |
| Concluir | não | não | accepted + término passado | negar |
| Gerenciar vínculo | owner | não | não | negar |
| Demanda não atendida | autor autorizado + consentimento | mesma regra | não | negar |
| Agregados | projeção autorizada, grupos >=5 | mesma regra | mesma regra | negar individuais |

RLS futura default deny. Separar catálogo dos dados privados. Cliente não edita owner_user_id, alvo da reserva ou credential_status. Vínculo revogado invalida consultas futuras, sem depender de cache. Familiares não recebem acesso clínico. Agregados não contêm endereço, pessoa, texto livre ou célula pequena.

Testes obrigatórios: anon, owner, familiar view-only/book-only, vínculo revogado, outro usuário, profissional correto/incorreto. RLS/RPC ainda não implementadas; helper TS não substitui enforcement.
