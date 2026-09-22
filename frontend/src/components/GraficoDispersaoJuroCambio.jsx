import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Dispersão juro real x câmbio — não é um gráfico de linha do tempo de
 * propósito: as duas variáveis têm escala diferente (% vs R$), então um
 * gráfico de eixo único misturando as duas seria o anti-padrão de "dois
 * eixos Y" (skill dataviz). Dispersão é a forma certa pra mostrar relação
 * entre duas variáveis — é literalmente o que o coeficiente de correlação
 * descreve.
 */
export function GraficoDispersaoJuroCambio({ dados, chaveY, cor, rotuloEixoY }) {
  const pontos = dados
    .filter((linha) => linha.juro_real_mensal_pct != null && linha[chaveY] != null)
    .map((linha) => ({
      x: linha.juro_real_mensal_pct,
      y: linha[chaveY],
      mes: linha.mes,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="var(--color-grid)" />
        <XAxis
          type="number"
          dataKey="x"
          name="Juro real mensal"
          unit="%"
          stroke="var(--color-axis)"
          tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={rotuloEixoY}
          stroke="var(--color-axis)"
          tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
          tickLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ stroke: "var(--color-axis)", strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const ponto = payload[0].payload;
            return (
              <div className="chart-tooltip">
                <div className="chart-tooltip__data">{ponto.mes}</div>
                <div className="chart-tooltip__linha">
                  <span className="chart-tooltip__nome">Juro real</span>
                  <strong className="chart-tooltip__valor">{ponto.x.toFixed(2)}%</strong>
                </div>
                <div className="chart-tooltip__linha">
                  <span className="chart-tooltip__nome">{rotuloEixoY}</span>
                  <strong className="chart-tooltip__valor">{ponto.y.toFixed(4)}</strong>
                </div>
              </div>
            );
          }}
        />
        <Scatter data={pontos} fill={cor} isAnimationActive={false} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
