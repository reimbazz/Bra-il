# frontend

Dashboard React + Vite, consumindo a API em `/api/*` (mesmo domínio em
produção, ver ADR 0005).

## Telas

- **Visão Geral** (`/`) — stat tiles (Selic, IPCA, juro real, câmbio x3) + gráfico da Selic
- **Comparação de Moedas** (`/comparacao-moedas`) — USD/EUR/CNY em base 100
- **Juro Real x Câmbio** (`/juro-real-x-cambio`) — dispersão (não linha do
  tempo: juro real é % e câmbio é R$, escalas diferentes — dois eixos Y
  seria o anti-padrão que a skill `dataviz` proíbe) + correlação de Pearson
  por moeda (`GET /api/correlacao`)
- **Metodologia** (`/metodologia`) — fontes, composição de BRL/CNY, fórmula
  do juro real, aviso de correlação x causalidade

## Design

Paleta categórica (uma cor fixa por moeda, nunca ciclada) validada com o
script da skill `dataviz` (`node scripts/validate_palette.js`) — light e
dark mode, checagem de separação CVD e contraste. USD = azul, EUR =
laranja, CNY = aqua (slots 1–3 do tema padrão, os únicos 3 que validam
"all-pairs" simultaneamente). Identidade da marca (verde petróleo + dourado
queimado) fica separada da paleta de dado — ver `src/styles/tokens.css`.

Tipografia Inter, tema claro/escuro com toggle manual (persistido em
`localStorage`, com fallback silencioso se o storage estiver bloqueado).

## Setup local

```bash
npm install
cp .env.example .env.local   # aponta pro uvicorn local (porta 8000)
npm run dev
```

Precisa da API rodando em paralelo (`uvicorn api.index:app --reload`, ver
`api/README.md`) — o Vite (porta 5173) e a API (porta 8000) são servidores
separados em dev; só viram a mesma origem em produção na Vercel.

## Testes

```bash
npm test        # vitest — hooks e utils com fetch/API mockados
npm run lint    # eslint
npm run build   # build de produção
```

## Convenções (skill `react-style`)

- componentes funcionais + hooks, nunca class component
- separar busca de dado (hook, `src/hooks/`) de apresentação (componente
  puro) — hooks nunca renderizam, componentes nunca fazem fetch direto
- toda tela que busca dado trata `carregando` / `erro` / `sucesso`
  (`Spinner` / `MensagemDeErro` / conteúdo real)
- sem lógica de cálculo dentro de componente — correlação vem pronta da API
  (`GET /api/correlacao`, calculada em SQL), normalização de câmbio vem
  pronta do dbt (`mart_cambio_base100`); o frontend só faz reshape de
  apresentação (`src/utils/pivotarSeriesPorData.js`), nunca estatística

## Achados reais (rodando de verdade, não só nos testes)

Verificação visual feita com Playwright headless contra a API real — 2
bugs que nenhum teste unitário isolado pegaria:

1. **Ordem do eixo X quebrada**: a API ordena por `moeda, data` (não por
   `data` primeiro); o pivot de formato longo→largo preservava a ordem de
   inserção do `Map`, que não é cronológica quando o intervalo de datas de
   uma moeda não bate exatamente com o das outras. `pivotarSeriesPorData`
   agora ordena por `data` explicitamente no fim — com teste de regressão
   cobrindo entrada fora de ordem.
2. **Gráfico "sumia"**: a animação de entrada padrão do Recharts (~1,5s)
   não terminava a tempo num gráfico de ~2900 pontos (11 anos x 3 moedas),
   então o screenshot pegava o meio da animação. `isAnimationActive={false}`
   em todo `<Line>`/`<Scatter>` — também mais adequado ao tom "sóbrio" do
   projeto do que uma animação chamativa.
