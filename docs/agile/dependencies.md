# Dependências e execução

Referências GitHub são reais; arestas nativas/sub-issues não disponíveis no conector. Labels + links e pr-policy oferecem coordenação verificável, sem substituir proteções administrativas.

Wave 0 (0–6h): bootstrap, revisão dos contratos/qualidade/políticas e proteção externa. Wave 1 (6–16h): quatro operadores em UI, domínio, perfis e Auth/fixtures. Wave 2 (16–28h): busca/reserva/aceite/família e concorrência. Wave 3 (28–36h): jornada, smoke e correções; Demand/FamilyPay apenas se a jornada P0 estiver estável. Wave 4: futuro, sem consumir hackathon.

Caminho crítico: BOOT -> 0.1/0.2/0.5 -> 2.1/2.2 -> 4.1 -> 4.4 e 5.1 -> 5.2 -> 8.2 -> 8.3/8.4 -> 8.5. A disponibilidade do árbitro, identidades e API administrativa também bloqueia. Serializar contratos, package/lock, CI e migrations.

Após fundação integrada e 0.5 resolvida, podem começar independentemente: Gabriel 1.1; Lucas 2.2/3.4 em sequência; Julio 1.3 ou 3.1; Matheus 2.3 ou 2.1. Não há Story dependente Ready agora.

| Story | Bloqueada por |
| --- | --- |
| 0.1 (0.1) | BOOT |
| 0.2 (0.2) | BOOT |
| 0.3 (0.3) | BOOT |
| 0.4 (0.4) | BOOT |
| 0.5 (0.5) | identidade/API/proteções externas |
| 1.1 (1.1) | 0.1, 0.2, 0.3, 0.4, 0.5 |
| 1.2 (1.2) | 0.1, 0.2, 0.5, 2.2 |
| 1.3 (1.3) | 0.1, 0.2, 0.5 |
| 2.1 (2.1) | 0.1, 0.2, 0.5 |
| 2.2 (2.2) | 0.2, 0.5 |
| 2.3 (2.3) | 0.1, 0.2, 0.5 |
| 3.1 (3.1) | 0.2, 0.5 |
| 3.2 (3.2) | 1.1, 1.3, 2.3, 3.1, 3.4 |
| 3.3 (3.3) | 0.2, 2.2, 3.1 |
| 3.4 (3.4) | 0.2, 0.5 |
| 4.1 (4.1) | 2.1, 2.2, 3.1 |
| 4.2 (4.2) | 1.1, 1.3, 3.2, 4.1 |
| 4.3 (4.3) | 1.3, 2.1, 4.1 |
| 4.4 (4.4) | 4.1 |
| 5.1 (5.1) | 2.1, 2.2, 4.1 |
| 5.2 (5.2) | 1.3, 4.1, 5.1 |
| 5.3 (5.3) | 5.2, 8.2 |
| 6.1 (6.1) | 3.4, 5.1 |
| 6.2 (6.2) | 1.3, 3.2, 6.1 |
| 6.3 (6.3) | 6.1 |
| 7.1 (7.1) | 5.2, 8.2 |
| 8.1 (8.1) | 3.2, 4.2, 4.3, 5.2 |
| 8.2 (8.2) | 4.2, 4.3, 4.4, 5.2 |
| 8.3 (8.3) | 8.1, 8.2 |
| 8.4 (8.4) | 0.5, 8.1, 8.2 |
| 8.5 (8.5) | 8.3, 8.4 |
| F.1 (F.1) | 8.5 |
| F.2 (F.2) | 8.5 |
| F.3 (F.3) | 8.5 |
| F.4 (F.4) | 8.5 |
| F.5 (F.5) | 8.5 |
| F.6 (F.6) | 8.5 |
| F.7 (F.7) | 8.5 |
| F.8 (F.8) | 8.5 |
