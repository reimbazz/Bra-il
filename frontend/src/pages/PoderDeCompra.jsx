import { useMemo, useState } from "react";

import { ComoLer } from "../components/ComoLer.jsx";
import { FiltroSeries } from "../components/FiltroSeries.jsx";
import { GraficoSerieTemporal } from "../components/GraficoSerieTemporal.jsx";
import { MensagemDeErro } from "../components/MensagemDeErro.jsx";
import { SeletorPeriodo } from "../components/SeletorPeriodo.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { StatTile } from "../components/StatTile.jsx";
import { usePoderDeCompra } from "../hooks/usePoderDeCompra.js";
import { formatarMesAno } from "../utils/datas.js";
import { formatarNumero } from "../utils/formatarNumero.js";
import { rebasearBase100 } from "../utils/rebasearBase100.js";
import { SERIES_MOEDAS } from "../utils/seriesMoedas.js";

// Preços primeiro: é a referência contra a qual as moedas são comparadas
const SERIES = [
  { chave: "IPCA", rotulo: "Preços no Brasil (IPCA)", cor: "var(--color-accent)" },
  ...SERIES_MOEDAS,
];

const DESCRICAO_SERIE = {
  IPCA: "Produtos e serviços no Brasil",
  USD: "Dólares comprados com R$ 100",
  EUR: "Euros comprados com R$ 100",
  CNY: "Yuans comprados com R$ 100",
};

const formatarReais = (valor) => `R$ ${formatarNumero(valor)}`;

function formatarVariacao(valor) {
  const variacao = valor - 100;
  const sinal = variacao > 0 ? "+" : "";
  return `${sinal}${formatarNumero(variacao, 1)}%`;
}

export function PoderDeCompra() {
  const { dados, carregando, erro } = usePoderDeCompra();
  const [ativas, setAtivas] = useState(SERIES.map(({ chave }) => chave));
  const [periodoEscolhido, setPeriodoEscolhido] = useState(null);

  // Formato largo com o nível de cada série no fim do mês; o rebase a partir
  // do mês inicial escolhido transforma tudo em "quanto custa hoje o que
  // custava R$ 100 naquele mês".
  const serie = useMemo(
    () =>
      (dados ?? []).map((linha) => ({
        data: linha.mes,
        IPCA: linha.indice_ipca,
        USD: linha.cambio_brl_usd_fim_de_mes,
        EUR: linha.cambio_brl_eur_fim_de_mes,
        CNY: linha.cambio_brl_cny_fim_de_mes,
      })),
    [dados]
  );

  const dataMin = serie[0]?.data;
  const dataMax = serie.at(-1)?.data;
  const periodo = periodoEscolhido ?? { inicio: dataMin, fim: dataMax };

  const serieVisivel = useMemo(() => {
    const naJanela = serie.filter((linha) => linha.data >= periodo.inicio && linha.data <= periodo.fim);
    return rebasearBase100(
      naJanela,
      SERIES.map(({ chave }) => chave),
      { ancorarNaPrimeiraLinha: true }
    );
  }, [serie, periodo.inicio, periodo.fim]);

  if (carregando) return <Spinner rotulo="Carregando poder de compra" />;
  if (erro) return <MensagemDeErro detalhe={erro.message} />;

  const mesInicial = serieVisivel[0]?.data;
  const ultimaLinha = serieVisivel.at(-1);

  return (
    <>
      <section>
        <h1>Poder de compra</h1>
        <p className="pagina__intro">
          Com o tempo, o mesmo dinheiro compra menos. Esta tela mostra quanto
          seria preciso gastar hoje para comprar o que R$ 100 compravam no
          passado, tanto em produtos e serviços no Brasil quanto em moeda
          estrangeira.
        </p>
      </section>

      {ultimaLinha && mesInicial ? (
        <section>
          <h2 className="titulo-resumo">
            O que custava R$ 100 em {formatarMesAno(mesInicial)} custa, em {formatarMesAno(ultimaLinha.data)}:
          </h2>
          <div className="stat-tiles">
            {SERIES.map(({ chave, rotulo, cor }) =>
              ultimaLinha[chave] != null ? (
                <StatTile
                  key={chave}
                  label={rotulo}
                  prefixo="R$"
                  valor={formatarNumero(ultimaLinha[chave])}
                  corDestaque={cor}
                  descricao={`${DESCRICAO_SERIE[chave]} · ${formatarVariacao(ultimaLinha[chave])}`}
                />
              ) : null
            )}
          </div>
        </section>
      ) : null}

      <section className="card">
        <div className="secao-grafico">
          <h2>Quanto custa hoje o que custava R$ 100</h2>
          <ComoLer>
            <p>
              Escolha o mês de partida nos botões ou nas datas. Todas as linhas
              começam em <strong>R$ 100</strong> nesse mês e mostram, mês a mês,
              quanto seria preciso gastar para comprar a mesma coisa.
            </p>
            <p>
              A linha dourada representa os <strong>preços no Brasil</strong>,
              medidos pelo IPCA, a inflação oficial. As demais mostram o custo,
              em reais, da quantidade de dólares, euros ou yuans que R$ 100
              compravam no início.
            </p>
            <p>
              Quando a linha de uma moeda fica <strong>acima</strong> da linha
              dos preços, aquela moeda encareceu mais do que a inflação
              brasileira: viajar, importar ou comprar algo cotado nela ficou
              relativamente mais caro. Quando fica abaixo, aconteceu o contrário.
            </p>
          </ComoLer>
          {dataMin ? (
            <div className="controles-grafico">
              <FiltroSeries series={SERIES} ativas={ativas} onChange={setAtivas} />
              <SeletorPeriodo
                dataMin={dataMin}
                dataMax={dataMax}
                inicio={periodo.inicio}
                fim={periodo.fim}
                onChange={setPeriodoEscolhido}
                datasManuais
              />
            </div>
          ) : null}
          <GraficoSerieTemporal
            dados={serieVisivel}
            series={SERIES.filter(({ chave }) => ativas.includes(chave))}
            altura={340}
            larguraEixoY={64}
            formatarEixoY={(valor) => `R$ ${formatarNumero(valor, 0)}`}
            formatarValor={formatarReais}
            linhaReferenciaY={100}
            onZoom={setPeriodoEscolhido}
          />
          <p className="grafico__legenda-periodo">
            Valores de fim de mês: preços acumulados pelo IPCA até o fim de cada
            mês e câmbio pela última cotação do mês.
          </p>
        </div>
      </section>
    </>
  );
}
