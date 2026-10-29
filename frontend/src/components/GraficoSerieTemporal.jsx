import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatarDataCompleta, gerarTicksTemporais } from "../utils/datas.js";
import { ChartTooltip } from "./ChartTooltip.jsx";

import "./GraficoSerieTemporal.css";

/**
 * Gráfico de linha com eixo de tempo diário, compartilhado pelas telas.
 *
 * - Eixo X com ticks "redondos" (início de mês/trimestre/ano), ver `gerarTicksTemporais`.
 * - Zoom por arraste: clicar e arrastar sobre o gráfico seleciona um
 *   intervalo e chama `onZoom({inicio, fim})`. Quem guarda o período é a
 *   página — o mesmo estado dos botões de período, então "Tudo" desfaz o zoom.
 *
 * @param series [{chave, rotulo, cor}] — uma linha por série
 */
export function GraficoSerieTemporal({
  dados,
  series,
  formatarValor,
  formatarEixoY,
  unidadeY,
  larguraEixoY = 44,
  altura = 300,
  tipoLinha = "monotone",
  linhaReferenciaY,
  onZoom,
}) {
  const [selecao, setSelecao] = useState(null);

  const { ticks, formatar } = useMemo(() => gerarTicksTemporais(dados.map((linha) => linha.data)), [dados]);

  const rotulos = Object.fromEntries(series.map(({ chave, rotulo }) => [chave, rotulo]));

  function iniciarSelecao(estado) {
    if (!onZoom || !estado?.activeLabel) return;
    setSelecao({ de: estado.activeLabel, ate: estado.activeLabel });
  }

  function moverSelecao(estado) {
    if (!selecao || !estado?.activeLabel) return;
    setSelecao((atual) => ({ ...atual, ate: estado.activeLabel }));
  }

  function finalizarSelecao() {
    if (selecao && selecao.de !== selecao.ate) {
      const [inicio, fim] = [selecao.de, selecao.ate].sort();
      onZoom({ inicio, fim });
    }
    setSelecao(null);
  }

  return (
    <div className={onZoom ? "grafico-temporal grafico-temporal--zoom" : "grafico-temporal"}>
      <ResponsiveContainer width="100%" height={altura}>
        <LineChart
          data={dados}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          onMouseDown={iniciarSelecao}
          onMouseMove={moverSelecao}
          onMouseUp={finalizarSelecao}
          onMouseLeave={() => setSelecao(null)}
        >
          <CartesianGrid stroke="var(--color-grid)" vertical={false} />
          <XAxis
            dataKey="data"
            ticks={ticks}
            interval={0}
            tickFormatter={formatar}
            stroke="var(--color-axis)"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            stroke="var(--color-axis)"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            tickLine={false}
            width={larguraEixoY}
            unit={unidadeY}
            tickFormatter={formatarEixoY}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatarValor={formatarValor}
                formatarRotulo={formatarDataCompleta}
                rotulos={rotulos}
              />
            }
          />
          {linhaReferenciaY != null ? (
            <ReferenceLine y={linhaReferenciaY} stroke="var(--color-axis)" strokeDasharray="4 4" />
          ) : null}
          {series.map(({ chave, cor }) => (
            <Line
              key={chave}
              type={tipoLinha}
              dataKey={chave}
              stroke={cor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)" }}
              connectNulls
              // Milhares de pontos: a animação de entrada do Recharts fica
              // lenta/incompleta nesse volume (achado renderizando de verdade).
              isAnimationActive={false}
            />
          ))}
          {selecao ? (
            <ReferenceArea
              x1={selecao.de}
              x2={selecao.ate}
              fill="var(--color-brand)"
              fillOpacity={0.12}
              strokeOpacity={0}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
      {onZoom ? <p className="grafico-temporal__dica">Arraste sobre o gráfico para dar zoom num intervalo.</p> : null}
    </div>
  );
}
