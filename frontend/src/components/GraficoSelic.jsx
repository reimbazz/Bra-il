import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "./ChartTooltip.jsx";

/**
 * Série única (Selic meta) — sem legenda por design (skill dataviz: "um
 * swatch só restata o título"), o título da seção já diz o que é.
 */
export function GraficoSelic({ dados }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={dados} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
          width={40}
          unit="%"
        />
        <Tooltip
          content={
            <ChartTooltip
              formatarValor={(valor) => `${valor.toFixed(2)}%`}
              rotulos={{ selic_meta_pct_aa: "Selic meta" }}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="selic_meta_pct_aa"
          stroke="var(--color-brand)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)" }}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
