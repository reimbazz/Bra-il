import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { pivotarSeriesPorData } from "../utils/pivotarSeriesPorData.js";
import { ChartTooltip } from "./ChartTooltip.jsx";

// Ordem fixa, nunca ciclada — mesma cor por moeda em todo o app (skill dataviz).
const SERIES = [
  { moeda: "USD", cor: "var(--color-series-usd)" },
  { moeda: "EUR", cor: "var(--color-series-eur)" },
  { moeda: "CNY", cor: "var(--color-series-cny)" },
];

export function GraficoComparacaoMoedas({ dados }) {
  const dadosLargos = pivotarSeriesPorData(dados, {
    chaveCategoria: "moeda",
    chaveValor: "valor_base100",
  });

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={dadosLargos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-grid)" vertical={false} />
        <XAxis
          dataKey="data"
          stroke="var(--color-axis)"
          tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          stroke="var(--color-axis)"
          tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<ChartTooltip formatarValor={(valor) => valor.toFixed(1)} />} />
        <Legend wrapperStyle={{ fontSize: 13, color: "var(--color-text-secondary)" }} />
        {SERIES.map(({ moeda, cor }) => (
          <Line
            key={moeda}
            type="monotone"
            dataKey={moeda}
            name={moeda}
            stroke={cor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)" }}
            connectNulls
            // ~2900 pontos (11 anos, 3 moedas): a animação de entrada padrão
            // do Recharts fica lenta/incompleta nesse volume — achado
            // renderizando de verdade (o gráfico "sumia" no screenshot
            // porque a captura acontecia no meio da animação).
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
