import { useMemo, useState } from "react";

import { ComoLer } from "../components/ComoLer.jsx";
import { GraficoSelic } from "../components/GraficoSelic.jsx";
import { MensagemDeErro } from "../components/MensagemDeErro.jsx";
import { SeletorPeriodo } from "../components/SeletorPeriodo.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { StatTile } from "../components/StatTile.jsx";
import { useIndicadoresDiarios } from "../hooks/useIndicadoresDiarios.js";
import { useJurosInflacao } from "../hooks/useJurosInflacao.js";
import { formatarMesAno, inicioDoPeriodo } from "../utils/datas.js";
import { formatarNumero } from "../utils/formatarNumero.js";
import { ultimoValorValido } from "../utils/ultimoValorValido.js";

const PERIODO_PADRAO_MESES = 24;

export function VisaoGeral() {
  // Histórico completo: os botões de período (até "Tudo") filtram no cliente
  const indicadores = useIndicadoresDiarios();
  const jurosInflacao = useJurosInflacao();
  const [periodoEscolhido, setPeriodoEscolhido] = useState(null);

  // Só dias com Selic — IPCA/câmbio vêm null em vários dias (mart sem forward-fill)
  const serieSelic = useMemo(
    () => (indicadores.dados ?? []).filter((linha) => linha.selic_meta_pct_aa != null),
    [indicadores.dados]
  );

  const dataMin = serieSelic[0]?.data;
  const dataMax = serieSelic.at(-1)?.data;
  const periodo = periodoEscolhido ?? {
    inicio: dataMin ? inicioDoPeriodo(PERIODO_PADRAO_MESES, dataMin, dataMax) : null,
    fim: dataMax,
  };

  const selicVisivel = useMemo(
    () => serieSelic.filter((linha) => linha.data >= periodo.inicio && linha.data <= periodo.fim),
    [serieSelic, periodo.inicio, periodo.fim]
  );

  if (indicadores.carregando || jurosInflacao.carregando) return <Spinner rotulo="Carregando visão geral" />;
  if (indicadores.erro) return <MensagemDeErro detalhe={indicadores.erro.message} />;
  if (jurosInflacao.erro) return <MensagemDeErro detalhe={jurosInflacao.erro.message} />;

  const linhas = indicadores.dados;
  const ultimoMes = jurosInflacao.dados.at(-1);
  const referenciaMensal = ultimoMes ? `12 meses até ${formatarMesAno(ultimoMes.mes)}` : null;

  return (
    <>
      <section>
        <h1>Visão geral</h1>
        <p className="pagina__intro">
          Um resumo dos principais indicadores acompanhados neste painel, com
          os valores mais recentes divulgados pelo Banco Central. A Selic e o
          câmbio são atualizados a cada dia útil; a inflação, uma vez por mês.
        </p>
      </section>

      <section className="stat-tiles">
        <StatTile
          label="Selic meta"
          valor={formatarNumero(ultimoValorValido(linhas, "selic_meta_pct_aa"))}
          unidade="% a.a."
          descricao="Taxa básica de juros da economia, definida pelo Banco Central"
        />
        <StatTile
          label="Inflação (IPCA)"
          valor={ultimoMes ? formatarNumero(ultimoMes.ipca_12m_pct) : null}
          unidade="%"
          descricao={referenciaMensal ? `Alta dos preços nos ${referenciaMensal}` : null}
        />
        <StatTile
          label="Juro real"
          valor={ultimoMes ? formatarNumero(ultimoMes.juro_real_12m_pct) : null}
          unidade="% a.a."
          descricao="Quanto a Selic rende acima da inflação"
        />
        <StatTile
          label="Dólar"
          prefixo="R$"
          valor={formatarNumero(ultimoValorValido(linhas, "cambio_brl_usd"))}
          corDestaque="var(--color-series-usd)"
          descricao="Preço de 1 dólar americano"
        />
        <StatTile
          label="Euro"
          prefixo="R$"
          valor={formatarNumero(ultimoValorValido(linhas, "cambio_brl_eur"))}
          corDestaque="var(--color-series-eur)"
          descricao="Preço de 1 euro"
        />
        <StatTile
          label="Yuan"
          prefixo="R$"
          valor={formatarNumero(ultimoValorValido(linhas, "cambio_brl_cny"))}
          corDestaque="var(--color-series-cny)"
          descricao="Preço de 1 yuan chinês"
        />
      </section>

      <section className="card">
        <h2>Selic meta</h2>
        <ComoLer titulo="O que é a Selic">
          <p>
            A Selic é a taxa de juros que serve de referência para toda a
            economia: ela influencia o rendimento das aplicações, o custo dos
            empréstimos e, indiretamente, a inflação e o câmbio. O Banco Central
            a eleva para conter a inflação e a reduz para estimular a atividade.
          </p>
          <p>
            A taxa só muda nas reuniões do Copom, que acontecem a cada 45 dias,
            aproximadamente. Por isso a linha avança em degraus.
          </p>
        </ComoLer>
        {dataMin ? (
          <div className="controles-grafico">
            <SeletorPeriodo
              dataMin={dataMin}
              dataMax={dataMax}
              inicio={periodo.inicio}
              fim={periodo.fim}
              onChange={setPeriodoEscolhido}
            />
          </div>
        ) : null}
        <GraficoSelic dados={selicVisivel} onZoom={setPeriodoEscolhido} />
      </section>
    </>
  );
}
