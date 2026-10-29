import { useMemo, useState } from "react";

import { ComoLer } from "../components/ComoLer.jsx";
import { FiltroSeries } from "../components/FiltroSeries.jsx";
import { GraficoComparacaoMoedas } from "../components/GraficoComparacaoMoedas.jsx";
import { MensagemDeErro } from "../components/MensagemDeErro.jsx";
import { SeletorPeriodo } from "../components/SeletorPeriodo.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { useCambioBase100 } from "../hooks/useCambioBase100.js";
import { formatarDataCompleta, inicioDoPeriodo } from "../utils/datas.js";
import { pivotarSeriesPorData } from "../utils/pivotarSeriesPorData.js";
import { rebasearBase100 } from "../utils/rebasearBase100.js";
import { SERIES_MOEDAS } from "../utils/seriesMoedas.js";

const PERIODO_PADRAO_MESES = 24;

export function ComparacaoMoedas() {
  const { dados, carregando, erro } = useCambioBase100();
  const [moedas, setMoedas] = useState(SERIES_MOEDAS.map(({ chave }) => chave));
  // null = ainda não escolhido; usa os últimos 2 anos assim que os dados chegam
  const [periodoEscolhido, setPeriodoEscolhido] = useState(null);

  // Câmbio bruto (R$ por moeda) em formato largo — o rebase é feito na janela visível
  const dadosLargos = useMemo(
    () => (dados ? pivotarSeriesPorData(dados, { chaveCategoria: "moeda", chaveValor: "valor" }) : []),
    [dados]
  );

  const dataMin = dadosLargos[0]?.data;
  const dataMax = dadosLargos.at(-1)?.data;
  const periodo = periodoEscolhido ?? {
    inicio: dataMin ? inicioDoPeriodo(PERIODO_PADRAO_MESES, dataMin, dataMax) : null,
    fim: dataMax,
  };

  const dadosVisiveis = useMemo(() => {
    const naJanela = dadosLargos.filter((linha) => linha.data >= periodo.inicio && linha.data <= periodo.fim);
    return rebasearBase100(naJanela, moedas);
  }, [dadosLargos, periodo.inicio, periodo.fim, moedas]);

  if (carregando) return <Spinner rotulo="Carregando comparação de moedas" />;
  if (erro) return <MensagemDeErro detalhe={erro.message} />;

  return (
    <section className="card">
      <h1>Comparação de moedas</h1>
      <p className="pagina__intro">
        Esta tela mostra o desempenho relativo do Real frente ao dólar, ao
        euro e ao yuan: em qual período a nossa moeda ganhou ou perdeu valor,
        e contra quais moedas isso aconteceu com mais intensidade.
      </p>

      <ComoLer>
        <p>
          Todas as linhas partem de <strong>100</strong> no primeiro dia do
          período escolhido. A partir daí, cada ponto indica quanto a moeda
          estrangeira ficou mais cara ou mais barata em reais desde aquele dia.
        </p>
        <p>
          Por exemplo, se a linha do dólar marca <strong>110</strong>, comprar
          dólares ficou 10% mais caro do que no início do período, ou seja, o
          Real <strong>perdeu valor</strong>. Se marca <strong>95</strong>, o
          dólar ficou 5% mais barato e o Real <strong>ganhou valor</strong>.
        </p>
        <p>
          Esse formato existe porque as cotações têm tamanhos muito diferentes:
          um dólar custa cerca de R$ 5, enquanto um yuan custa menos de R$ 1.
          Partindo todas do mesmo ponto, é possível comparar a variação de cada
          uma de forma justa.
        </p>
      </ComoLer>

      <div className="controles-grafico">
        <FiltroSeries series={SERIES_MOEDAS} ativas={moedas} onChange={setMoedas} rotuloGrupo="Moedas exibidas" />
        {dataMin ? (
          <SeletorPeriodo
            dataMin={dataMin}
            dataMax={dataMax}
            inicio={periodo.inicio}
            fim={periodo.fim}
            onChange={setPeriodoEscolhido}
            datasManuais
          />
        ) : null}
      </div>

      {dataMin ? (
        <p className="grafico__legenda-periodo">
          Ponto de partida (100): {formatarDataCompleta(dadosVisiveis[0]?.data)} · até{" "}
          {formatarDataCompleta(periodo.fim)}
        </p>
      ) : null}

      <GraficoComparacaoMoedas dados={dadosVisiveis} moedas={moedas} onZoom={setPeriodoEscolhido} />
    </section>
  );
}
