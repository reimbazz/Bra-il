/**
 * Transforma formato longo [{data, moeda, valor}, ...] em formato largo
 * [{data, USD: valor, EUR: valor, ...}] — é reshape pra desenhar o
 * gráfico, não cálculo de negócio (isso already veio pronto da API).
 *
 * Sempre devolve ordenado por `data`: a API ordena por `moeda, data` (não
 * por `data` primeiro), então a ordem de inserção no Map não é cronológica
 * quando o intervalo de datas de uma categoria não bate exatamente com o
 * das outras — sem esse sort o gráfico de linha desenha zigue-zague ou não
 * desenha nada (achado renderizando de verdade, não só no teste unitário).
 */
export function pivotarSeriesPorData(linhas, { chaveCategoria, chaveValor }) {
  const porData = new Map();

  for (const linha of linhas) {
    const data = linha.data;
    if (!porData.has(data)) {
      porData.set(data, { data });
    }
    porData.get(data)[linha[chaveCategoria]] = linha[chaveValor];
  }

  return Array.from(porData.values()).sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));
}
