/** Legenda simples acima do gráfico, para quando não há filtro de séries fazendo esse papel. */
export function LegendaSeries({ series }) {
  return (
    <ul className="legenda-series">
      {series.map(({ chave, rotulo, cor }) => (
        <li key={chave}>
          <span className="legenda-series__marcador" style={{ backgroundColor: cor }} aria-hidden="true" />
          {rotulo}
        </li>
      ))}
    </ul>
  );
}
