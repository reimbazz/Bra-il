# Data Dictionary — Bra$il

Confirmado manualmente conforme procedimento obrigatório da skill
`02-data-understanding` (busca no localizador, chamada `curl` real à API,
conferência contra valor público conhecido). Data da confirmação: 2026-09-17.

## Banco Central do Brasil — API SGS

`https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados?formato=json`

| Série | Código SGS | Unidade | Frequência | Observação | Checagem feita |
|---|---|---|---|---|---|
| Selic (meta definida pelo Copom) | **432** | % a.a. | diária (valor repetido até novo Copom) | — | 13,75 em 01–05/09/2022 ✅ bate com o histórico real da taxa Selic |
| IPCA (variação mensal) | **433** | % | mensal (data = primeiro dia do mês de referência) | sem gap de fim de semana (é mensal) | 0,53 em 01/2023 ✅ bate com o valor oficial divulgado pelo IBGE/mercado |
| BRL/USD (PTAX venda) | **1** | R$ por US$ | diária (dias úteis) | gap em fim de semana/feriado — pipeline precisa tratar isso, não assumir dado todo dia | 5,3436–5,4459 em 02–04/01/2023 ✅ consistente com a cotação amplamente divulgada da época |
| BRL/EUR (PTAX venda) | **21619** | R$ por € | diária (dias úteis) | mesmo gap de fim de semana/feriado do USD | 5,6979–5,7748 em 02–04/01/2023 ✅ consistente com BRL/USD × EUR/USD do período |

## BRL/CNY — sem série oficial do BC (ver ADR 0004)

Confirmado que **não existe** série SGS nem entrada no catálogo oficial de
moedas do boletim PTAX
(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas`)
para yuan/renminbi (lista oficial: AUD, CAD, CHF, DKK, EUR, GBP, JPY, NOK,
SEK, USD — CNY não está presente).

| Série | Fonte | Fórmula | Observação |
|---|---|---|---|
| BRL/CNY (composto) | BRL/USD (BC, série 1) ÷ USD/CNY (Frankfurter API) | `brl_por_cny = brl_por_usd_bc / cny_por_usd_frankfurter` | herda o timing de duas fixações diferentes (PTAX BR x referência BCE) — expor isso na tela de Metodologia |

`https://api.frankfurter.app/{data}?from=USD&to=CNY` — gratuita, sem
autenticação, dados de referência do Banco Central Europeu. Validado em
03/01/2023: USD/CNY = 6,9097, resultando em BRL/CNY = 0,7780 (composto)
contra 0,7776 do cross direto BRL→CNY da própria Frankfurter — divergência
de ~0,05%, compatível com fixações em horários diferentes.

## Checklist de qualidade da fonte (aplicado)

- **Gap de fim de semana/feriado**: existe para as três séries de câmbio
  (USD, EUR, CNY); não existe para Selic (repete o último valor) nem para
  IPCA (mensal). O pipeline de ingestão não pode assumir dado todo dia
  corrido.
- **Revisão retroativa**: a documentar/observar na prática durante a fase
  de ingestão — se o BC reprocessar um valor já publicado, o pipeline
  precisa reprocessar histórico periodicamente, não só inserir dado novo
  (ver skill `03-data-preparation`).
- **Data de início de cada série**: não confirmada numericamente nesta
  passada (o endpoint `/dados/primeiros/1` da API SGS recusou a requisição
  neste ambiente — a confirmar depois, não é bloqueante para começar a
  ingestão incremental a partir de hoje).
