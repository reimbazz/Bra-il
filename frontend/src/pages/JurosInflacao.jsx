import { useMemo, useState } from "react";

import { ComoLer } from "../components/ComoLer.jsx";
import { GraficoSerieTemporal } from "../components/GraficoSerieTemporal.jsx";
import { LegendaSeries } from "../components/LegendaSeries.jsx";
import { MensagemDeErro } from "../components/MensagemDeErro.jsx";
import { SeletorPeriodo } from "../components/SeletorPeriodo.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { StatTile } from "../components/StatTile.jsx";
import { useJurosInflacao } from "../hooks/useJurosInflacao.js";
import { formatarMesAno } from "../utils/datas.js";
import { formatarNumero } from "../utils/formatarNumero.js";

const SERIES_JUROS_INFLACAO = [
  { chave: "selic", rotulo: "Selic meta", cor: "var(--color-brand)" },
  { chave: "ipca12m", rotulo: "Inflação em 12 meses (IPCA)", cor: "var(--color-accent)" },
];

const SERIES_JURO_REAL = [{ chave: "juroReal", rotulo: "Juro real", cor: "var(--color-text-primary)" }];

const formatarPct = (valor) => `${formatarNumero(valor)}%`;

export function JurosInflacao() {
  const { dados, carregando, erro } = useJurosInflacao();
  const [periodoEscolhido, setPeriodoEscolhido] = useState(null);

  // O gráfico temporal trabalha com `data`; aqui a granularidade é mensal
  const serie = useMemo(
    () =>
      (dados ?? []).map((linha) => ({
        data: linha.mes,
        selic: linha.selic_meta_pct_aa,
        ipca12m: linha.ipca_12m_pct,
        juroReal: linha.juro_real_12m_pct,
      })),
    [dados]
  );

  const dataMin = serie[0]?.data;
  const dataMax = serie.at(-1)?.data;
  // Série mensal é curta (~10 anos): o padrão é mostrar tudo
  const periodo = periodoEscolhido ?? { inicio: dataMin, fim: dataMax };

  const serieVisivel = useMemo(
    () => serie.filter((linha) => linha.data >= periodo.inicio && linha.data <= periodo.fim),
    [serie, periodo.inicio, periodo.fim]
  );

  if (carregando) return <Spinner rotulo="Carregando juros e inflação" />;
  if (erro) return <MensagemDeErro detalhe={erro.message} />;

  const ultimo = dados.at(-1);

  return (
    <>
      <section>
        <h1>Juros e inflação</h1>
        <p className="pagina__intro">
          A taxa de juros só é alta ou baixa quando comparada à inflação. Uma
          Selic de 14% significa uma coisa quando os preços sobem 4% ao ano e
          outra muito diferente quando sobem 10%. Esta tela coloca as duas
          taxas lado a lado para mostrar quanto, de fato, o juro rendeu acima
          da alta de preços.
        </p>
      </section>

      {ultimo ? (
        <section className="stat-tiles">
          <StatTile
            label="Selic meta"
            valor={formatarNumero(ultimo.selic_meta_pct_aa)}
            unidade="% a.a."
            descricao={`Vigente no fim de ${formatarMesAno(ultimo.mes)}`}
          />
          <StatTile
            label="Inflação em 12 meses"
            valor={formatarNumero(ultimo.ipca_12m_pct)}
            unidade="%"
            descricao={`IPCA acumulado até ${formatarMesAno(ultimo.mes)}`}
          />
          <StatTile
            label="Juro real"
            valor={formatarNumero(ultimo.juro_real_12m_pct)}
            unidade="% a.a."
            descricao="Ganho da Selic depois de descontada a inflação"
          />
        </section>
      ) : null}

      <section className="card">
        <div className="secao-grafico">
          <h2>Selic e inflação</h2>
          <p className="secao-grafico__subtitulo">
            As duas taxas estão na mesma unidade (% ao ano), por isso dividem o
            mesmo eixo.
          </p>
          <ComoLer>
            <p>
              A distância entre as duas linhas é o <strong>juro real</strong>.
              Quando a linha verde (Selic) está acima da dourada (inflação), quem
              aplica à taxa básica ganha poder de compra. Quando a inflação passa
              por cima da Selic, o juro real fica negativo: o dinheiro rende, mas
              rende menos do que os preços sobem.
            </p>
          </ComoLer>
          {dataMin ? (
            <div className="controles-grafico">
              <LegendaSeries series={SERIES_JUROS_INFLACAO} />
              <SeletorPeriodo
                dataMin={dataMin}
                dataMax={dataMax}
                inicio={periodo.inicio}
                fim={periodo.fim}
                onChange={setPeriodoEscolhido}
              />
            </div>
          ) : null}
          <GraficoSerieTemporal
            dados={serieVisivel}
            series={SERIES_JUROS_INFLACAO}
            altura={300}
            unidadeY="%"
            formatarValor={formatarPct}
            onZoom={setPeriodoEscolhido}
          />
        </div>
      </section>

      <section className="card">
        <div className="secao-grafico">
          <h2>Juro real</h2>
          <p className="secao-grafico__subtitulo">
            Quanto a Selic rende acima da inflação dos últimos 12 meses. A linha
            tracejada marca o zero: abaixo dela, o juro perde para a inflação.
          </p>
          <GraficoSerieTemporal
            dados={serieVisivel}
            series={SERIES_JURO_REAL}
            altura={220}
            unidadeY="%"
            formatarValor={formatarPct}
            linhaReferenciaY={0}
            onZoom={setPeriodoEscolhido}
          />
        </div>
      </section>
    </>
  );
}
