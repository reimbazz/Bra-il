# dbt

Transformação dos dados brutos (schema `raw`, populado pelo `backend/`) em
tabelas prontas para o dashboard. Roda como segundo job do workflow
`ingest-and-transform.yml`, depois da ingestão, usando a role `dbt_transform`
(privilégio mínimo, ver ADR 0006).

## Camadas (ver skill `03-data-preparation`)

```
staging      (stg_)   1:1 com a fonte, renomeia/tipa — zero lógica de negócio
intermediate (int_)   joins e métricas derivadas (juro real, cross-rate CNY)
marts        (mart_)  tabela final, consumida pela API — materializada como table
```

O schema real no Postgres é exatamente `staging`/`intermediate`/`marts`
(não `<schema>_staging`) — ver `macros/get_custom_schema.sql`.

## Modelos

- `stg_selic_meta` (SGS 432), `stg_ipca_mensal` (SGS 433),
  `stg_cambio_brl_usd` (SGS 1), `stg_cambio_brl_eur` (SGS 21619),
  `stg_cambio_usd_cny` (Frankfurter — não é do BC, ver ADR 0004)
- `int_cambio_brl_cny_cross` — BRL/CNY composto (BRL/USD ÷ USD/CNY)
- `int_cambio_consolidado` — as 3 moedas em formato longo
- `int_juro_real_mensal` — juro real via Fisher (Selic meta convertida pro
  equivalente mensal antes de comparar com o IPCA — ver comentário no SQL
  do modelo; a skill `04-modeling` sugere "Selic − IPCA" em linguagem
  solta, mas subtrair direto misturaria % a.a. com % mensal)
- `int_cambio_fim_de_mes` — última cotação de cada moeda no mês (base dos marts mensais)
- `mart_indicadores_diarios`, `mart_cambio_base100`, `mart_juro_real_vs_cambio`,
  `mart_juros_inflacao` (Selic x IPCA 12 meses), `mart_poder_de_compra`
  (índice de preços acumulado x câmbio de fim de mês)

Todo modelo de mart/intermediate com granularidade de série temporal tem
`not_null`, `unique` (ou `dbt_utils.unique_combination_of_columns` nos
formatos longos) e `dbt_utils.accepted_range` nos valores plausíveis —
`accepted_range` não é nativo do dbt-core, vem do pacote `dbt_utils` (ver
`packages.yml`).

## Setup local

```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r dbt/requirements.txt
cd dbt && dbt deps   # instala dbt_utils
```

Variáveis de ambiente necessárias (ver `.env.example` na raiz):
`DBT_PGHOST`, `DBT_PGUSER`, `DBT_PGPASSWORD`, `DBT_PGDATABASE`. O adaptador
dbt-postgres não aceita uma connection string única como o psycopg2, só
campos separados — por isso a diferença em relação ao padrão usado em
`backend/`.

## Rodar

```bash
cd dbt
dbt run    # materializa staging -> intermediate -> marts
dbt test   # not_null, unique, accepted_range, etc.
```

`dbt_transform` já tem `CREATE` no banco (ADR 0006) para criar os schemas
`staging`/`intermediate`/`marts` sozinho na primeira execução — nada a
configurar manualmente no Neon além do que já foi feito na Fase 3.
