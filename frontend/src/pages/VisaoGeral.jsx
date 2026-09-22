import { GraficoSelic } from "../components/GraficoSelic.jsx";
import { MensagemDeErro } from "../components/MensagemDeErro.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { StatTile } from "../components/StatTile.jsx";
import { useIndicadoresDiarios } from "../hooks/useIndicadoresDiarios.js";
import { useJuroRealVsCambio } from "../hooks/useJuroRealVsCambio.js";
import { formatarNumero } from "../utils/formatarNumero.js";
import { ultimoValorValido } from "../utils/ultimoValorValido.js";

function calcularDataInicioPadrao() {
  const data = new Date();
  data.setFullYear(data.getFullYear() - 2);
  return data.toISOString().slice(0, 10);
}

const DATA_INICIO_PADRAO = calcularDataInicioPadrao();

export function VisaoGeral() {
  const indicadores = useIndicadoresDiarios({ dataInicio: DATA_INICIO_PADRAO });
  const juroReal = useJuroRealVsCambio();

  if (indicadores.carregando || juroReal.carregando) return <Spinner rotulo="Carregando visão geral" />;
  if (indicadores.erro) return <MensagemDeErro detalhe={indicadores.erro.message} />;
  if (juroReal.erro) return <MensagemDeErro detalhe={juroReal.erro.message} />;

  const linhas = indicadores.dados;
  const ultimoJuroReal = juroReal.dados.at(-1);

  return (
    <>
      <section>
        <h1>Visão geral</h1>
        <p className="pagina__intro">
          Últimos valores publicados. Selic e câmbio são diários; IPCA e juro
          real são mensais.
        </p>
      </section>

      <section className="stat-tiles">
        <StatTile
          label="Selic meta"
          valor={formatarNumero(ultimoValorValido(linhas, "selic_meta_pct_aa"))}
          unidade="% a.a."
        />
        <StatTile
          label="IPCA do mês"
          valor={formatarNumero(ultimoValorValido(linhas, "ipca_mensal_pct"))}
          unidade="%"
        />
        <StatTile
          label="Juro real do mês"
          valor={ultimoJuroReal ? formatarNumero(ultimoJuroReal.juro_real_mensal_pct) : null}
          unidade="%"
        />
        <StatTile
          label="BRL/USD"
          valor={formatarNumero(ultimoValorValido(linhas, "cambio_brl_usd"), 4)}
          corDestaque="var(--color-series-usd)"
        />
        <StatTile
          label="BRL/EUR"
          valor={formatarNumero(ultimoValorValido(linhas, "cambio_brl_eur"), 4)}
          corDestaque="var(--color-series-eur)"
        />
        <StatTile
          label="BRL/CNY"
          valor={formatarNumero(ultimoValorValido(linhas, "cambio_brl_cny"), 4)}
          corDestaque="var(--color-series-cny)"
        />
      </section>

      <section className="card">
        <h2>Selic meta — últimos 2 anos</h2>
        <GraficoSelic dados={linhas} />
      </section>
    </>
  );
}
