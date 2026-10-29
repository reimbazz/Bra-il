/**
 * Re-normaliza cada série à base 100 no primeiro valor da janela visível.
 *
 * O mart (`mart_cambio_base100`) ancora o 100 no primeiro dia de toda a
 * história de cada moeda. Ao dar zoom num período, isso faz o gráfico
 * começar em, por exemplo, 168 — e a pergunta natural ("quanto o Real
 * perdeu ou ganhou *neste período*?") fica sem resposta direta. Rebasear
 * na janela é só uma mudança de referência visual, a partir do câmbio
 * bruto (`valor`) que a API já devolve; nenhum número novo é inventado.
 *
 * @param linhasLargas [{data, USD: 5.1, EUR: 5.6, ...}] ordenado por data
 * @param chaves moedas a rebasear
 * @param ancorarNaPrimeiraLinha se true, série sem valor na primeira linha
 *   fica toda null em vez de ancorar numa data posterior — usado quando o
 *   texto da tela afirma um ponto de partida comum ("R$ 100 em jan/2015").
 */
export function rebasearBase100(linhasLargas, chaves, { ancorarNaPrimeiraLinha = false } = {}) {
  const ancora = {};
  for (const chave of chaves) {
    const primeira = ancorarNaPrimeiraLinha
      ? linhasLargas[0]
      : linhasLargas.find((linha) => linha[chave] != null);
    ancora[chave] = primeira?.[chave] ?? null;
  }

  return linhasLargas.map((linha) => {
    const nova = { data: linha.data };
    for (const chave of chaves) {
      const valor = linha[chave];
      nova[chave] = valor != null && ancora[chave] ? (valor / ancora[chave]) * 100 : null;
    }
    return nova;
  });
}
