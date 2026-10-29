import { formatarNumero } from "../utils/formatarNumero.js";
import { GraficoSerieTemporal } from "./GraficoSerieTemporal.jsx";

const SERIES = [{ chave: "selic_meta_pct_aa", rotulo: "Selic meta", cor: "var(--color-brand)" }];

/**
 * Série única (Selic meta) — sem legenda por design (skill dataviz: "um
 * swatch só restata o título"), o título da seção já diz o que é.
 * Linha em degrau: a Selic meta só muda em reunião do Copom, não varia
 * continuamente entre uma decisão e outra.
 */
export function GraficoSelic({ dados, onZoom }) {
  return (
    <GraficoSerieTemporal
      dados={dados}
      series={SERIES}
      altura={260}
      larguraEixoY={48}
      tipoLinha="stepAfter"
      unidadeY="%"
      formatarValor={(valor) => `${formatarNumero(valor)}% a.a.`}
      onZoom={onZoom}
    />
  );
}
