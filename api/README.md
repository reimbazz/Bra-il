# api

API de leitura, hospedada como Vercel Serverless Function (Python/FastAPI)
no mesmo projeto Vercel do frontend. **Somente leitura** dos marts do dbt —
nunca ingere nem transforma dado (ver ADR 0005 e 0006).

## Endpoints

| Rota | Mart | Filtros |
|---|---|---|
| `GET /api/health` | — | nenhum (não toca no banco) |
| `GET /api/indicadores/diarios` | `mart_indicadores_diarios` | `data_inicio`, `data_fim` |
| `GET /api/cambio/base100` | `mart_cambio_base100` | `moeda` (repetível: `?moeda=USD&moeda=EUR`), `data_inicio`, `data_fim` |
| `GET /api/juro-real-vs-cambio` | `mart_juro_real_vs_cambio` | `data_inicio`, `data_fim` |
| `GET /api/correlacao` | `mart_juro_real_vs_cambio` (agregado) | nenhum — sempre as 3 moedas |

`moeda` é validado contra o enum `USD`/`EUR`/`CNY` (ADR 0004) — valor fora
disso devolve `422` antes de qualquer query rodar.

## Módulos

- `index.py` — app FastAPI única: CORS e rotas centralizados aqui (ADR 0005)
- `config.py` — lê `DATABASE_URL_READONLY` e `ALLOWED_ORIGINS` do ambiente
- `db.py` — conexão nova por chamada (padrão serverless — cada invocação é isolada)
- `schemas.py` — modelos Pydantic de resposta, um por mart
- `routers/indicadores.py` — os 3 endpoints de dado

## Setup local

```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r api/requirements-dev.txt
```

Variáveis necessárias (ver `.env.example` na raiz): `DATABASE_URL_READONLY`
(role `api_readonly`) e `ALLOWED_ORIGINS`.

## Rodar

```bash
uvicorn api.index:app --reload
```

## Testes

```bash
pytest api/tests
```

Banco sempre mockado (`@patch("api.routers.indicadores.executar_query")`)
— os testes cobrem caminho principal, filtro de período/moeda, moeda
inválida (422), erro de banco não vaza detalhe da exceção pro cliente
(500 genérico), e CORS bloqueando origem não listada.

## Segurança (ver skill `security` e ADR 0006)

- `ALLOWED_ORIGINS` via env var, nunca `"*"` — testado explicitamente
  (`test_cors_bloqueia_origem_nao_listada`).
- Credencial usada aqui é a role `api_readonly`: **somente SELECT** nos
  marts — mesmo que a API seja o serviço mais exposto (voltado à
  internet), um secret vazado aqui só permite ler dado que já é público.
- **Antes de configurar a Vercel (Fase 9)**: trocar `DATABASE_URL_READONLY`
  pelo endpoint **pooled** do Neon (sufixo `-pooler`) — o valor usado aqui
  em dev é o direto, que funciona bem localmente mas esgotaria o limite de
  conexões simultâneas do tier gratuito em produção serverless (ver ADR 0001).
- Rate limiting: decisão ainda pendente (ADR 0007), ver seção Segurança do
  plano do projeto — nenhum limite aplicado por enquanto.
