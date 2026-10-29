import "./StatTile.css";

/**
 * Contrato de stat tile da skill dataviz: label + value, sem dois-pontos,
 * número em fonte proporcional. `descricao` explica em uma linha o que o
 * número significa — o painel é lido por quem não é economista.
 */
export function StatTile({ label, valor, unidade, prefixo, descricao, corDestaque }) {
  return (
    <div className="stat-tile card">
      <span className="stat-tile__label">{label}</span>
      <span className="stat-tile__valor" style={corDestaque ? { color: corDestaque } : undefined}>
        {valor != null && prefixo ? <span className="stat-tile__unidade">{prefixo} </span> : null}
        {valor ?? "—"}
        {valor != null && unidade ? <span className="stat-tile__unidade"> {unidade}</span> : null}
      </span>
      {descricao ? <span className="stat-tile__descricao">{descricao}</span> : null}
    </div>
  );
}
