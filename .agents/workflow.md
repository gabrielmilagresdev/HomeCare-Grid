# Fluxo do hackathon

DUAL_AGENT_MODE: um Lucas Operacional e um Lucas Árbitro, em checkouts diferentes.

Issue → código/testes → PR para develop. Árbitro → revisão/correções → quality e pr-policy atuais → merge. O operacional continua a próxima funcionalidade após integração. Status/labels são organização, não autorização administrativa.

Qualquer branch de tarefa é aceita, incluindo codex/hackathon-mvp; usar uma Issue principal na descrição (Refs #numero). Dependências técnicas podem ser implementadas juntas no mesmo PR. Declarar bloqueios técnicos reais na seção Bloqueios técnicos; não usar encerramento de Issues como substituto de testes/código.

main recebe develop por PR. PR #52 é a promoção histórica; revisar seu escopo antes de integrar como entrega do app. A release do MVP continua rastreável no backlog.

Não são gates: #2/#17/#53/#56/#58/#59 fechadas, cinco ambientes, piloto, broker, reservas ou revisão humana obrigatória. Não falsificar aceites ou fechar itens para deixar CI verde.

O ruleset temporário mantém PR, checks, atualização da branch, conversas resolvidas e proteção contra exclusão/force push. Backup e restauração em docs/operations/ruleset-hackathon.json.
