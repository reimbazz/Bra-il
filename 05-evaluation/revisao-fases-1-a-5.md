# Revisão (Fase 6) — Fases 1 a 5

Aplicação do checklist de revisão de código de IA da skill `05-evaluation`
sobre tudo construído até aqui (`backend/`, `dbt/`, `analysis/`), mais o
fechamento de lacunas de teste e a validação de sanidade externa que a
skill exige antes de aceitar um número como pronto pro dashboard.

## Checklist de revisão de código gerado por IA

**1. Trade-off explicado, ou só código entregue?**
Sim, em cada decisão relevante: ADRs 0001–0006 documentam banco, monorepo,
API própria, composição de CNY, deploy e roles. Descobertas durante a
execução (janela de 10 anos da API SGS, duplicata de série mensal, grant
de SELECT faltando, Decimal quebrando o scipy) foram documentadas nos
comentários do código e relatadas no momento em que aconteceram, não
silenciadas.

**2. Solução mais simples possível, ou over-engineered?**
- `backend/`: uma função por responsabilidade (fetch, validar, persistir,
  checkpoint), sem abstração de "cliente genérico de API" prematura — cada
  fonte (BC, Frankfurter) tem seu próprio client simples.
- `dbt/`: 3 camadas enxutas, sem camada extra desnecessária. `int_juro_real_mensal`
  ficou mais complexo que "Selic − IPCA" da skill 04 em linguagem solta,
  mas por necessidade real (unidades incompatíveis — % a.a. vs % mensal —
  não por preferência de complexidade).
- `analysis/`: não duplicou a normalização em Python (já existe em SQL no
  mart) — decisão documentada no próprio `analysis/README.md`.
- Nenhuma abstração para casos hipotéticos futuros (ex.: não criamos uma
  camada de "múltiplos provedores de câmbio" plugável — só os dois que
  existem hoje, com o segundo tratado como exceção documentada na ADR 0004).

**3. Dependência nova sem necessidade clara?**
Toda dependência nova tem motivo registrado: `dbt_utils` (testes
`accepted_range`/`unique_combination_of_columns` que a própria skill 03
pede e não existem no dbt-core), `scipy` (Pearson e regressão linear —
citado explicitamente na skill 04), `pandas`/`numpy` (skill 04 nomeia
"Python/pandas" para essa camada). Nenhuma dependência para resolver algo
que já tinha solução mais simples — ex.: descartamos SQLAlchemy (bastava
ler via cursor) e Upstash/rate-limiting (fora de escopo até a Fase 7).

**4. Segue as convenções já fixadas nas outras skills?**
snake_case, type hints, docstring Google style, sem SQL interpolado, sem
`except:` genérico (sempre `except Exception as erro` com comentário
justificando o motivo de ser amplo), Conventional Commits nas mensagens
combinadas — nenhuma commitada ainda, mas seguido no texto proposto quando
chegar a hora. `ruff`/`black` limpos em todo `.py` do repo.

**5. Existe teste cobrindo o caminho principal e pelo menos um caso de erro?**
Era "sim, mas incompleto" antes desta fase — corrigido agora:

| Módulo | Antes da Fase 6 | Depois |
|---|---|---|
| `backend/ingestion/checkpoint.py` | 0 testes automatizados (só verificação manual contra o Neon) | 3 testes (conexão mockada): sem checkpoint anterior, com checkpoint anterior, parametrização correta do upsert |
| `backend/ingestion/repository.py` | 0 testes automatizados | 2 testes: lista vazia não toca no cursor, linhas montadas corretamente e SQL sem interpolação |
| `analysis/data_access.py` | 0 testes — foi exatamente o módulo que quebrou em produção (Decimal → dtype object → scipy) | 2 testes de regressão para essa conversão |

## Bug real sem cobertura que essa revisão fechou

`analysis/data_access.py` tinha o bug mais sério encontrado no projeto até
agora (crash em produção, não só resultado errado) e zero teste. A causa
raiz (o driver psycopg2 devolvendo `Decimal`) só é verificável contra um
Postgres de verdade — por isso a correção agora tem **duas camadas**:
1. `register_type` na conexão real (já validado rodando contra o Neon).
2. Conversão defensiva em Python puro logo depois de montar o DataFrame —
   essa é a camada testável sem banco, e é ela que carrega os dois novos
   testes de regressão.

Essa dupla camada é o tipo de decisão que vale registrar: a correção "que
funciona" (o `register_type`) não bastava sozinha porque não dava pra
provar que continua funcionando amanhã sem rodar contra produção toda vez.

## Validação de sanidade contra fonte externa (skill 05)

BRL/USD em `mart_indicadores_diarios`: **5,6309** (03/01/2022) →
**5,2177** (29/12/2022), apreciação de ~7,3% no ano. Bate com o fato
amplamente noticiado de que o Real foi uma das moedas emergentes que mais
se valorizou em 2022, puxado pelo carry trade da Selic em patamar elevado
— não é um número inventado nem uma coincidência de sinal, é consistente
com o consenso de mercado da época.

(Ver também a validação já feita na Fase 4 para o cálculo de juro real via
Fisher, ago/2022: Selic 13,75% a.a. + IPCA -0,36% → juro real mensal de
1,44%, recalculado manualmente e batendo com a fórmula.)

## O que fica em aberto (não é regressão, é escopo)

- `analysis/correlation.py` e `regression_lag.py` continuam sem teste
  contra dado real (só sintético) — aceitável, porque cálculo estatístico
  puro é exatamente o tipo de lógica que synthetic data cobre bem (skill
  05: "o teste não pode depender da API/banco estar no ar").
- Não existe ainda CI (GitHub Actions) rodando esses testes automaticamente
  a cada push — isso é Fase 9 (deployment), não uma lacuna desta fase.
- Suite completa (`backend/tests` + `analysis/tests`) verificada rodando
  junto num único ambiente: **33 testes, todos passando**, `ruff`/`black`
  limpos, `pip-audit` sem vulnerabilidade conhecida nas dependências
  pinadas de `backend/` e `analysis/`.
