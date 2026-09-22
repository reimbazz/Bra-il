import { GraficoComparacaoMoedas } from "../components/GraficoComparacaoMoedas.jsx";
import { MensagemDeErro } from "../components/MensagemDeErro.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { useCambioBase100 } from "../hooks/useCambioBase100.js";

export function ComparacaoMoedas() {
  const { dados, carregando, erro } = useCambioBase100();

  if (carregando) return <Spinner rotulo="Carregando comparação de moedas" />;
  if (erro) return <MensagemDeErro detalhe={erro.message} />;

  return (
    <section className="card">
      <h1>Comparação de moedas</h1>
      <p className="pagina__intro">
        USD, EUR e CNY normalizadas à base 100 no primeiro dia disponível de
        cada série — mostra desempenho relativo do Real, não o câmbio em
        reais (que tem escalas bem diferentes entre as 3 moedas).
      </p>
      <GraficoComparacaoMoedas dados={dados} />
    </section>
  );
}
