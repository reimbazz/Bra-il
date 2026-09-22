# analysis

Análise estatística em Python/pandas, separada da ingestão e do dbt (ver
skill `04-modeling`). Lê os marts do dbt via role `api_readonly` (somente
leitura) — não escreve no banco.

## Módulos

- `data_access.py` — único lugar que sabe fazer SQL/conectar no banco;
  devolve DataFrame pronto. Cálculo não sabe de onde o dado veio.
- `correlation.py` — correlação de Pearson entre juro real e câmbio, com
  p-valor, tamanho de amostra e período sempre juntos (regra da skill 04:
  nunca mostrar coeficiente sem esse contexto). Cálculo puro, sem plot.
- `regression_lag.py` — regressão linear simples testando várias
  defasagens (meses) entre juro real e câmbio. Cálculo puro, sem plot.
- `run_analysis.py` — script que junta os três e imprime um relatório;
  rodar localmente pra conferir os números antes de expor no dashboard.

**Por que não tem `normalization.py`**: a normalização em base 100 das 3
moedas (item 2 da progressão da skill 04) já é um cálculo simples e
reutilizável, então mora em SQL no `dbt` (`mart_cambio_base100`), não aqui
— ver a própria skill 04: "cálculo simples e reutilizável → modelo mart_
do dbt". Duplicar em Python seria a mesma conta duas vezes.

## Setup local

```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r analysis/requirements-dev.txt
```

Variável de ambiente necessária: `DATABASE_URL_READONLY` (role
`api_readonly`, ver `.env.example` na raiz e ADR 0006).

## Rodar

```bash
python -m analysis.run_analysis   # relatório completo
pytest analysis/tests             # testes com DataFrame sintético, sem banco
```

## Regra de honestidade estatística (skill 04)

- Todo coeficiente de correlação vem com tamanho de amostra e período —
  `ResultadoCorrelacao` força isso por construção.
- Nunca apresentar correlação/regressão como causalidade no texto do
  dashboard — `run_analysis.py` já imprime o aviso, reforçar na tela de
  Metodologia do frontend também.
