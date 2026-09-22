# ADR 0004: Composição de BRL/CNY via fonte externa (Frankfurter)

Data: 2026-09-17
Status: aceito

## Contexto
Confirmado via chamada manual à API SGS e ao catálogo oficial de moedas do
boletim PTAX (`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas`)
que o Banco Central **não publica cotação oficial de BRL/CNY** — nem como
série SGS dedicada, nem no boletim PTAX (a lista oficial de moedas do PTAX
cobre AUD, CAD, CHF, DKK, EUR, GBP, JPY, NOK, SEK, USD; yuan/renminbi não
está presente). Isso contraria a premissa original de "fonte única e
oficial" do projeto (skill `02-data-understanding`). A alternativa seria
remover CNY do escopo; o usuário optou por mantê-lo introduzindo uma fonte
externa.

## Decisão
Compor BRL/CNY usando **BRL/USD oficial do BC (PTAX, série SGS 1)** como
âncora, dividido pelo cross-rate **USD/CNY publicado pela Frankfurter API**
(`https://api.frankfurter.app`, dados de referência do BCE, gratuita, sem
autenticação, também usada por padrão como camada de resiliência caso o
Olinda/PTAX fique fora do ar para EUR):

```
brl_por_cny = brl_por_usd(BC, PTAX)  /  cny_por_usd(Frankfurter)
```

Validação feita: em 03/01/2023, BC informa BRL/USD = 5,3759 e Frankfurter
informa USD/CNY = 6,9097 → BRL/CNY calculado = 0,7780, contra 0,7776
retornado pelo cross direto BRL→CNY da própria Frankfurter (diferença de
~0,05%, dentro do esperado por virem de fixações em horários diferentes).

## Consequências
- Nova dependência externa ao Banco Central (Frankfurter API/BCE) — precisa
  de tratamento de erro/indisponibilidade independente do tratamento da API
  do BC (ver skill `security`: nunca assumir que resposta de API externa
  vem sempre no formato esperado).
- BRL/CNY herda o timing de **duas fixações diferentes** (PTAX brasileira e
  referência do BCE), que não fecham no mesmo horário do dia — isso precisa
  aparecer explicitamente na tela de Metodologia do dashboard, não só em
  comentário de código.
- Erro de composição acumula o spread/arredondamento de duas fontes em vez
  de uma. Aceitável para fins de portfólio/aprendizado, mas BRL/CNY nunca
  deve ser tratado com o mesmo nível de confiança que BRL/USD ou BRL/EUR
  (ambos PTAX direta) nas conclusões do dashboard.
- A tabela `raw` precisa de uma origem/fonte por linha (`fonte: 'bcb_sgs'`
  vs. `fonte: 'frankfurter'`) para essa distinção ficar rastreável até o
  dado bruto.
