import "./StatTile.css";

/** Contrato de stat tile da skill dataviz: label + value, sem dois-pontos, número em fonte proporcional. */
export function StatTile({ label, valor, unidade, corDestaque }) {
  return (
    <div className="stat-tile card">
      <span className="stat-tile__label">{label}</span>
      <span className="stat-tile__valor" style={corDestaque ? { color: corDestaque } : undefined}>
        {valor ?? "—"}
        {valor != null && unidade ? <span className="stat-tile__unidade"> {unidade}</span> : null}
      </span>
    </div>
  );
}
