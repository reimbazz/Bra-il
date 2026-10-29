import { formatarNumero } from "../utils/formatarNumero.js";
import { SERIES_MOEDAS } from "../utils/seriesMoedas.js";
import { GraficoSerieTemporal } from "./GraficoSerieTemporal.jsx";

function formatarBase100(valor) {
  const variacao = valor - 100;
  const sinal = variacao > 0 ? "+" : "";
  return `${formatarNumero(valor, 1)} (${sinal}${formatarNumero(variacao, 1)}%)`;
}

/**
 * @param dados formato largo já rebaseado: [{data, USD: 104.2, ...}]
 * @param moedas chaves visíveis (subconjunto de SERIES_MOEDAS)
 */
export function GraficoComparacaoMoedas({ dados, moedas, onZoom }) {
  return (
    <GraficoSerieTemporal
      dados={dados}
      series={SERIES_MOEDAS.filter(({ chave }) => moedas.includes(chave))}
      altura={340}
      formatarValor={formatarBase100}
      formatarEixoY={(valor) => formatarNumero(valor, 0)}
      linhaReferenciaY={100}
      onZoom={onZoom}
    />
  );
}
