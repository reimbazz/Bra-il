# Bra$il

Dashboard que acompanha como a política monetária brasileira (Selic, IPCA,
juro real) se reflete na força do Real frente a USD, EUR e CNY, usando dados
públicos da API SGS do Banco Central do Brasil.

## Escopo (business understanding)

**Pergunta que o projeto responde**: como a política monetária brasileira
(Selic, IPCA) se relaciona com a força do Real frente a USD, EUR e CNY?

**Para quem**: projeto de portfólio pessoal — serve tanto para aprendizado
(pipeline de dados ponta a ponta, do zero ao dashboard) quanto para avaliação
por recrutadores técnicos.

**Métricas de sucesso**:
- Pipeline de ingestão roda sem intervenção manual por período contínuo.
- Dashboard nunca atraso mais de D-1 em relação à publicação do dado oficial.
- Toda métrica derivada (ex.: juro real, normalização base 100) documentada
  no `schema.yml` do dbt e na tela de Metodologia do dashboard.

**Fora de escopo**: previsão de câmbio futuro. O projeto descreve e
correlaciona indicadores já publicados — não projeta valores futuros.

**Fontes de dado** (ver [`02-data-understanding/data-dictionary.md`](02-data-understanding/data-dictionary.md)
para os códigos confirmados e a checagem manual de cada um):
- Selic, IPCA, BRL/USD e BRL/EUR: API SGS do Banco Central (fonte oficial única).
- BRL/CNY: o Banco Central não publica cotação oficial para CNY — este par
  é **composto** a partir de BRL/USD (BC) e USD/CNY (Frankfurter API,
  referência do BCE). Ver [ADR 0004](01-business-understanding/adr/0004-composicao-cambio-cny.md)
  para o porquê e as limitações dessa composição.

## Arquitetura

Ver o ADR correspondente em [`01-business-understanding/adr/`](01-business-understanding/adr/)
para o raciocínio por trás de cada decisão. Resumo:

- **Ingestão + transformação**: GitHub Actions (cron) → Neon Postgres → dbt.
- **API**: FastAPI rodando como Vercel Serverless Function, somente leitura
  dos marts do dbt.
- **Frontend**: React + Vite, build estático servido pela Vercel no mesmo
  domínio da API.
- **Banco**: Neon Postgres (free tier), com três roles de privilégio mínimo
  (`ingest`, `dbt_transform`, `api_readonly`) — ver ADR 0006.

Fluxo completo:

```
API SGS do Banco Central
  -> GitHub Actions (ingest -> dbt)
  -> Neon Postgres
  -> API FastAPI (Vercel, somente leitura)
  -> Frontend React (Vercel)
```

## Estrutura do repositório

```
backend/      ingestão — roda só via GitHub Actions
api/          API de leitura — Vercel Serverless Functions
dbt/          transformação — staging -> intermediate -> marts
analysis/     análise estatística (correlação, normalização, lag)
frontend/     dashboard React
```

## Setup local

Copie `.env.example` para `.env` e preencha com as credenciais do seu Neon
de desenvolvimento (nunca commitar `.env` — ver `.gitignore`).

Detalhes de setup por camada estarão nos respectivos `README.md` de
`backend/`, `api/`, `dbt/` e `frontend/` conforme cada um for implementado.

## Aviso

Os dados exibidos são públicos, oferecidos pelo Banco Central do Brasil
(SGS). Este projeto tem fins educacionais/portfólio e não constitui
recomendação de investimento.
