import { GraficoDispersaoJuroCambio } from "../components/GraficoDispersaoJuroCambio.jsx";
import { MensagemDeErro } from "../components/MensagemDeErro.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { useCorrelacao } from "../hooks/useCorrelacao.js";
import { useJuroRealVsCambio } from "../hooks/useJuroRealVsCambio.js";
import { formatarMesAno } from "../utils/formatarMesAno.js";
import { formatarNumero } from "../utils/formatarNumero.js";

const MOEDAS = [
  { moeda: "USD", chaveY: "cambio_brl_usd_fim_de_mes", cor: "var(--color-series-usd)" },
  { moeda: "EUR", chaveY: "cambio_brl_eur_fim_de_mes", cor: "var(--color-series-eur)" },
  { moeda: "CNY", chaveY: "cambio_brl_cny_fim_de_mes", cor: "var(--color-series-cny)" },
];

export function JuroRealXCambio() {
  const juroReal = useJuroRealVsCambio();
  const correlacao = useCorrelacao();

  if (juroReal.carregando || correlacao.carregando) {
    return <Spinner rotulo="Carregando juro real x câmbio" />;
  }
  if (juroReal.erro) return <MensagemDeErro detalhe={juroReal.erro.message} />;
  if (correlacao.erro) return <MensagemDeErro detalhe={correlacao.erro.message} />;

  const correlacaoPorMoeda = Object.fromEntries(
    correlacao.dados.map((item) => [item.moeda, item])
  );

  return (
    <section>
      <h1>Juro real x câmbio</h1>
      <p className="pagina__intro">
        Cada ponto é um mês: juro real (Selic convertida pro equivalente
        mensal, menos IPCA — ver Metodologia) no eixo horizontal, câmbio de
        fim de mês no vertical.{" "}
        <strong>Correlação não implica causalidade</strong> — leia como
        "esteve associado a", nunca "causou".
      </p>

      <div className="grade-dispersao">
        {MOEDAS.map(({ moeda, chaveY, cor }) => {
          const stats = correlacaoPorMoeda[moeda];
          return (
            <div className="card" key={moeda}>
              <h2>{moeda}</h2>
              <GraficoDispersaoJuroCambio
                dados={juroReal.dados}
                chaveY={chaveY}
                cor={cor}
                rotuloEixoY={`BRL/${moeda}`}
              />
              <p className="grade-dispersao__stats">
                {stats?.coeficiente != null ? (
                  <>
                    r = <strong>{formatarNumero(stats.coeficiente, 3)}</strong> · n=
                    {stats.tamanho_amostra} · {formatarMesAno(stats.periodo_inicio)} a{" "}
                    {formatarMesAno(stats.periodo_fim)}
                  </>
                ) : (
                  "amostra insuficiente para correlação"
                )}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
