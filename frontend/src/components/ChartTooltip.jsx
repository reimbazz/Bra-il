import "./ChartTooltip.css";

/**
 * Tooltip compartilhado por todos os gráficos: valor em destaque, nome da
 * série secundário, marcador é um traço da cor da série (não uma caixa
 * cheia) — ver skill dataviz, references/interaction.md.
 */
export function ChartTooltip({ active, payload, label, formatarValor, rotulos = {} }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__data">{label}</div>
      {payload.map((entrada) => (
        <div className="chart-tooltip__linha" key={entrada.dataKey}>
          <span
            className="chart-tooltip__chave"
            style={{ backgroundColor: entrada.color }}
            aria-hidden="true"
          />
          <span className="chart-tooltip__nome">{rotulos[entrada.dataKey] ?? entrada.name}</span>
          <strong className="chart-tooltip__valor">
            {formatarValor ? formatarValor(entrada.value) : entrada.value}
          </strong>
        </div>
      ))}
    </div>
  );
}
