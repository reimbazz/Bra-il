import { Icone } from "../components/Icone.jsx";

import "./Metodologia.css";

const ETAPAS = [
  {
    icone: "coleta",
    titulo: "Coleta",
    texto:
      "Todos os dias, às 3h (horário de Brasília), um processo automático busca os valores mais recentes no Banco Central e na Frankfurter API.",
  },
  {
    icone: "banco",
    titulo: "Armazenamento",
    texto: "Os valores são guardados em um banco de dados exatamente como vieram da fonte, sem nenhuma alteração.",
  },
  {
    icone: "verificado",
    titulo: "Tratamento e conferência",
    texto:
      "Os indicadores derivados são calculados e testes automáticos conferem o resultado: datas repetidas, valores ausentes ou fora do esperado interrompem a atualização.",
  },
  {
    icone: "tela",
    titulo: "Publicação",
    texto: "O painel lê apenas o resultado final, já conferido. Nenhum número é digitado à mão.",
  },
];

const FONTES = [
  { indicador: "Selic meta", fonte: "Banco Central — SGS, série 432", frequencia: "Muda nas reuniões do Copom" },
  { indicador: "IPCA (inflação)", fonte: "IBGE, via Banco Central — SGS, série 433", frequencia: "Mensal" },
  { indicador: "Dólar (PTAX venda)", fonte: "Banco Central — SGS, série 1", frequencia: "Dias úteis" },
  { indicador: "Euro", fonte: "Banco Central — SGS, série 21619", frequencia: "Dias úteis" },
  {
    indicador: "Yuan",
    fonte: "Calculado: dólar (Banco Central) e yuan por dólar (Frankfurter API, referência do Banco Central Europeu)",
    frequencia: "Dias úteis",
  },
];

const GLOSSARIO = [
  {
    icone: "percentual",
    termo: "Selic",
    definicao:
      "Taxa básica de juros do país, definida pelo Comitê de Política Monetária (Copom) do Banco Central. Serve de referência para o rendimento das aplicações e para o custo dos empréstimos.",
  },
  {
    icone: "carrinho",
    termo: "IPCA",
    definicao:
      "Índice oficial de inflação, calculado pelo IBGE. Mede quanto subiram, em média, os preços dos produtos e serviços consumidos pelas famílias brasileiras.",
  },
  {
    icone: "alta",
    termo: "Juro real",
    definicao:
      "Rendimento dos juros depois de descontada a inflação. Indica se o dinheiro aplicado de fato ganhou poder de compra ou apenas acompanhou a alta dos preços.",
  },
  {
    icone: "cambio",
    termo: "Câmbio",
    definicao:
      "Preço de uma moeda estrangeira em reais. Quando o dólar passa de R$ 5,00 para R$ 5,50, é o Real que perdeu valor: são necessários mais reais para comprar o mesmo dólar.",
  },
  {
    icone: "base",
    termo: "Base 100",
    definicao:
      "Forma de comparar séries com valores muito diferentes. Todas começam em 100 no mesmo dia e passam a mostrar a variação percentual em relação a esse ponto de partida.",
  },
  {
    icone: "carteira",
    termo: "Poder de compra",
    definicao:
      "Quantidade de bens e serviços que uma quantia de dinheiro consegue comprar. Diminui sempre que os preços sobem, ou quando a moeda perde valor frente a outras.",
  },
];

const CALCULOS = [
  {
    titulo: "Inflação acumulada em 12 meses",
    explicacao:
      "As taxas mensais não são somadas, e sim multiplicadas: a alta de cada mês incide sobre preços que já subiram nos meses anteriores.",
    formula: "(1 + inflação do mês 1) × (1 + inflação do mês 2) × … × (1 + inflação do mês 12) − 1",
    exemplo: "Dois meses seguidos de 1% resultam em 2,01% acumulados, e não em 2%.",
  },
  {
    titulo: "Juro real",
    explicacao:
      "Usa a equação de Fisher. A subtração simples (Selic menos inflação) parece intuitiva, mas superestima o ganho, porque ignora que a inflação também corrói o próprio rendimento.",
    formula: "(1 + Selic) ÷ (1 + inflação em 12 meses) − 1",
    exemplo: "Selic de 13,75% e inflação de 4,58%: 1,1375 ÷ 1,0458 − 1 = 8,77% ao ano (a subtração simples daria 9,17%).",
  },
  {
    titulo: "Base 100",
    explicacao: "Cada valor é dividido pelo valor do primeiro dia do período escolhido.",
    formula: "valor do dia ÷ valor do primeiro dia × 100",
    exemplo: "Dólar a R$ 5,00 no início e a R$ 5,50 hoje: 5,50 ÷ 5,00 × 100 = 110, ou seja, alta de 10%.",
  },
  {
    titulo: "Poder de compra",
    explicacao:
      "Aplica a mesma ideia da base 100 aos preços (pelo IPCA acumulado) e às moedas, partindo de R$ 100 no mês escolhido.",
    formula: "R$ 100 × nível do mês atual ÷ nível do mês inicial",
    exemplo: "Se os preços acumularam alta de 87% desde o mês inicial, o que custava R$ 100 passa a custar R$ 187.",
  },
  {
    titulo: "Cotação do yuan",
    explicacao:
      "O Banco Central não divulga cotação oficial do yuan. O valor é obtido a partir do dólar: o preço do dólar em reais dividido pela quantidade de yuans que um dólar compra.",
    formula: "reais por yuan = reais por dólar ÷ yuans por dólar",
    exemplo: "Dólar a R$ 5,18 e US$ 1 = 6,70 yuans: 5,18 ÷ 6,70 = R$ 0,77 por yuan.",
  },
];

const CUIDADOS = [
  {
    titulo: "O yuan é uma estimativa",
    texto:
      "A cotação combina dois valores fechados em horários diferentes (Banco Central do Brasil e Banco Central Europeu). Pode haver pequena diferença em relação às cotações praticadas no mercado.",
  },
  {
    titulo: "O juro real é uma aproximação",
    texto:
      "Aqui, a Selic de hoje é comparada à inflação que já aconteceu nos últimos 12 meses. Analistas costumam usar a inflação esperada para os próximos 12 meses, o que pode levar a um número diferente.",
  },
  {
    titulo: "Telas mensais usam o fim do mês",
    texto:
      "Nas telas com dados mensais, o câmbio é a última cotação do mês e a Selic é a taxa vigente no último dia do mês.",
  },
  {
    titulo: "Existe uma defasagem natural",
    texto:
      "A atualização acontece de madrugada, com os dados do dia útil anterior. Fins de semana e feriados não têm cotação, e o IPCA de cada mês só é divulgado por volta do dia 10 do mês seguinte.",
  },
  {
    titulo: "Descreve o passado, não prevê o futuro",
    texto:
      "O painel mostra indicadores já publicados e como se relacionaram ao longo do tempo. Não faz projeções e não constitui recomendação de investimento.",
  },
];

export function Metodologia() {
  return (
    <div className="metodologia">
      <section>
        <h1>Metodologia</h1>
        <p className="pagina__intro">
          De onde vêm os dados deste painel, como cada número é calculado e
          quais cuidados tomar ao interpretá-los.
        </p>
      </section>

      <section className="card">
        <h2>O caminho dos dados</h2>
        <ol className="metodologia__etapas">
          {ETAPAS.map(({ icone, titulo, texto }, indice) => (
            <li key={titulo} className="metodologia__etapa">
              <div className="metodologia__etapa-cabecalho">
                <span className="metodologia__icone">
                  <Icone nome={icone} />
                </span>
                <span className="metodologia__etapa-numero">{indice + 1}</span>
              </div>
              <strong>{titulo}</strong>
              <p>{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2>Fontes</h2>
        <p className="metodologia__subtitulo">
          Todos os dados são públicos. Sempre que existe uma fonte oficial
          brasileira, ela é a única utilizada.
        </p>
        <div className="metodologia__tabela-container">
          <table className="metodologia__tabela">
            <thead>
              <tr>
                <th scope="col">Indicador</th>
                <th scope="col">Fonte</th>
                <th scope="col">Atualização</th>
              </tr>
            </thead>
            <tbody>
              {FONTES.map(({ indicador, fonte, frequencia }) => (
                <tr key={indicador}>
                  <th scope="row">{indicador}</th>
                  <td>{fonte}</td>
                  <td>{frequencia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Glossário</h2>
        <div className="metodologia__grade">
          {GLOSSARIO.map(({ icone, termo, definicao }) => (
            <article key={termo} className="card metodologia__termo">
              <span className="metodologia__icone">
                <Icone nome={icone} />
              </span>
              <h3>{termo}</h3>
              <p>{definicao}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Como os números são calculados</h2>
        <div className="metodologia__calculos">
          {CALCULOS.map(({ titulo, explicacao, formula, exemplo }) => (
            <article key={titulo} className="card metodologia__calculo">
              <h3>{titulo}</h3>
              <p>{explicacao}</p>
              <div className="metodologia__formula">{formula}</div>
              <p className="metodologia__exemplo">
                <strong>Exemplo:</strong> {exemplo}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Limites e cuidados na leitura</h2>
        <div className="metodologia__grade">
          {CUIDADOS.map(({ titulo, texto }) => (
            <article key={titulo} className="card metodologia__cuidado">
              <span className="metodologia__icone metodologia__icone--alerta">
                <Icone nome="alerta" />
              </span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card metodologia__codigo">
        <span className="metodologia__icone">
          <Icone nome="codigo" />
        </span>
        <div>
          <h2>Código aberto</h2>
          <p>
            Todo o processo, da coleta ao painel, está publicado no{" "}
            <a href="https://github.com/reimbazz/Bra-il" target="_blank" rel="noopener noreferrer">
              repositório do projeto no GitHub
            </a>
            , incluindo os cálculos e os testes descritos nesta página.
          </p>
        </div>
      </section>
    </div>
  );
}
