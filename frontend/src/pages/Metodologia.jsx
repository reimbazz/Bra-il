export function Metodologia() {
  return (
    <section className="card metodologia">
      <h1>Metodologia e premissas</h1>

      <h2>Fontes de dado</h2>
      <p>
        Selic (meta), IPCA (variação mensal), BRL/USD e BRL/EUR vêm direto da
        API SGS do Banco Central do Brasil — série 432, 433, 1 e 21619,
        respectivamente. É a única fonte oficial usada no projeto para essas
        4 séries.
      </p>
      <p>
        O Banco Central <strong>não publica</strong> cotação oficial de
        BRL/CNY — nem como série SGS, nem no boletim PTAX. BRL/CNY aqui é{" "}
        <strong>composto</strong>: BRL/USD (Banco Central) dividido por
        USD/CNY (Frankfurter API, referência do Banco Central Europeu). Isso
        herda o timing de duas fixações diferentes (PTAX brasileira e
        referência do BCE, que fecham em horários distintos do dia) — trate
        BRL/CNY com menos confiança que BRL/USD ou BRL/EUR.
      </p>

      <h2>Juro real</h2>
      <p>
        Selic é publicada em % ao ano; IPCA em % ao mês — subtrair um do
        outro diretamente misturaria unidade. O juro real mensal aqui usa a
        equação de Fisher: a Selic meta (do último dia com dado dentro do
        mês de referência do IPCA) é convertida pro equivalente mensal antes
        de comparar com o IPCA do mês.
      </p>

      <h2>Atualização</h2>
      <p>
        Ingestão e transformação rodam via cron diário. Câmbio e Selic têm
        gap em fim de semana e feriado (sem pregão); IPCA só existe no
        primeiro dia de cada mês, depois de publicado pelo IBGE/Banco
        Central.
      </p>

      <h2>Correlação e causalidade</h2>
      <p>
        Os coeficientes mostrados em "Juro Real x Câmbio" são correlação de
        Pearson simples, calculados sobre os meses com dado disponível
        (tamanho de amostra e período sempre exibidos junto).{" "}
        <strong>Correlação não implica causalidade</strong>: o fato de duas
        séries se moverem juntas não prova que uma determina a outra — outros
        fatores macroeconômicos afetam ambas ao mesmo tempo.
      </p>

      <h2>Escopo</h2>
      <p>
        O projeto descreve e correlaciona indicadores já publicados — não
        projeta ou prevê valor futuro de câmbio, Selic ou IPCA.
      </p>
    </section>
  );
}
