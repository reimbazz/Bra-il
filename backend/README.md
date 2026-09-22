# backend

Ingestão de dados da API SGS do Banco Central (mais o cross-rate USD/CNY da
Frankfurter API, ver ADR 0004). Roda **somente** via GitHub Actions
(`.github/workflows/ingest-and-transform.yml`) — nunca na Vercel.

## Módulos

- `ingestion/bcb_client.py` — fetch + validação de schema da resposta da API SGS
- `ingestion/frankfurter_client.py` — fetch + validação de schema da Frankfurter API (só USD/CNY)
- `ingestion/validators.py` — validação de faixa plausível antes de persistir
- `ingestion/checkpoint.py` — ponto de parada para ingestão incremental
- `ingestion/repository.py` — upsert parametrizado no Neon (nunca SQL interpolado)
- `ingestion/run_ingestion.py` — entrypoint do workflow (só orquestra)
- `ingestion/config.py` — leitura de env vars (`NEON_DATABASE_URL_INGEST`)
- `ingestion/schema.sql` — DDL idempotente do schema `raw` (rodar uma vez antes do primeiro `run_ingestion.py`)
- `shared/series_codes.py` — códigos confirmados manualmente (ver data dictionary)
- `shared/schemas.py` — modelos Pydantic que validam o formato da resposta de cada fonte

Códigos e fontes confirmados — ver
[`02-data-understanding/data-dictionary.md`](../02-data-understanding/data-dictionary.md):
Selic = 432, IPCA = 433, BRL/USD = 1, BRL/EUR = 21619 (todos série SGS do
BC); BRL/CNY é composto a partir de BRL/USD (BC) e USD/CNY (Frankfurter API,
sem série oficial do BC para esse par — ver ADR 0004).

## Setup local

```bash
python -m venv .venv
.venv/Scripts/activate         # Windows; source .venv/bin/activate no Linux/Mac
pip install -r backend/requirements-dev.txt
```

Antes da primeira ingestão:

1. Rodar `backend/ingestion/schema.sql` uma vez no SQL Editor do Neon (cria o schema `raw` e as tabelas).
2. Rodar `backend/ingestion/roles.sql` (troque as senhas placeholder antes) — cria as 3 roles de privilégio mínimo da ADR 0006: `ingest`, `dbt_transform`, `api_readonly`.
3. No console do Neon, pegar a connection string apontando para a role `ingest` (**endpoint direto**, não o `-pooler` — o job do Actions é uma execução curta, não precisa de pooling) e usar como `NEON_DATABASE_URL_INGEST` no `.env` local / GitHub Secrets.

A role `dbt_transform` só ganha uso real na fase 4 (dbt); a role
`api_readonly` só ganha `SELECT` nos marts depois do primeiro `dbt run`
(ver comentário no fim de `roles.sql`) — nada a fazer com elas agora.

## Testes

```bash
pytest backend/tests
ruff check backend
black --check backend
```

Todos os testes usam fixtures sintéticas em `tests/fixtures/` — não
dependem da API do BC nem da Frankfurter estarem no ar (skill
`05-evaluation`). `pip-audit -r backend/requirements.txt` deve ser rodado
periodicamente para checar vulnerabilidade em dependência.

## Rodar a ingestão manualmente

```bash
NEON_DATABASE_URL_INGEST=postgresql://... python -m backend.ingestion.run_ingestion
```

Idempotente: rodar duas vezes no mesmo dia não duplica registro (upsert por
`fonte, serie, data`) nem rebusca o histórico inteiro (checkpoint por
série).
