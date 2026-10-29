/**
 * Chips para ligar/desligar séries de um gráfico. Esconder uma série nunca
 * muda a cor das outras (skill dataviz), e sempre sobra pelo menos uma —
 * gráfico vazio não comunica nada.
 *
 * @param series [{chave, rotulo, cor}] na ordem fixa de exibição
 * @param ativas chaves visíveis
 * @param onChange recebe a nova lista de chaves visíveis, na ordem de `series`
 */
export function FiltroSeries({ series, ativas, onChange, rotuloGrupo = "Séries exibidas" }) {
  function alternar(chave) {
    if (ativas.includes(chave)) {
      if (ativas.length > 1) onChange(ativas.filter((c) => c !== chave));
      return;
    }
    onChange(series.map((s) => s.chave).filter((c) => c === chave || ativas.includes(c)));
  }

  return (
    <div className="filtro-series" role="group" aria-label={rotuloGrupo}>
      {series.map(({ chave, rotulo, cor }) => {
        const ativa = ativas.includes(chave);
        return (
          <button
            key={chave}
            type="button"
            className={ativa ? "filtro-series__chip filtro-series__chip--ativo" : "filtro-series__chip"}
            aria-pressed={ativa}
            onClick={() => alternar(chave)}
          >
            <span className="filtro-series__marcador" style={{ backgroundColor: cor }} aria-hidden="true" />
            {rotulo}
          </button>
        );
      })}
    </div>
  );
}
