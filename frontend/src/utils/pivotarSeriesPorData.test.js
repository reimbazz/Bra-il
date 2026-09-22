import { describe, expect, it } from "vitest";

import { pivotarSeriesPorData } from "./pivotarSeriesPorData.js";

describe("pivotarSeriesPorData", () => {
  it("agrupa por data com uma coluna por categoria", () => {
    const linhas = [
      { data: "2022-01-01", moeda: "USD", valor_base100: 100 },
      { data: "2022-01-01", moeda: "EUR", valor_base100: 100 },
      { data: "2022-01-02", moeda: "USD", valor_base100: 101.5 },
    ];

    const resultado = pivotarSeriesPorData(linhas, {
      chaveCategoria: "moeda",
      chaveValor: "valor_base100",
    });

    expect(resultado).toEqual([
      { data: "2022-01-01", USD: 100, EUR: 100 },
      { data: "2022-01-02", USD: 101.5 },
    ]);
  });

  it("lista vazia devolve lista vazia", () => {
    expect(pivotarSeriesPorData([], { chaveCategoria: "moeda", chaveValor: "valor" })).toEqual([]);
  });

  it("devolve ordenado por data mesmo quando a entrada vem agrupada por categoria primeiro (como a API real)", () => {
    // API ordena por "moeda, data" — CNY tem uma data que EUR não tem, o
    // que quebrava a ordem de inserção do Map antes do fix (bug real
    // encontrado renderizando o gráfico contra a API de verdade).
    const linhas = [
      { data: "2014-12-31", moeda: "CNY", valor_base100: 99 },
      { data: "2015-01-02", moeda: "CNY", valor_base100: 100 },
      { data: "2015-01-02", moeda: "EUR", valor_base100: 100 },
      { data: "2018-12-26", moeda: "EUR", valor_base100: 110 },
    ];

    const resultado = pivotarSeriesPorData(linhas, {
      chaveCategoria: "moeda",
      chaveValor: "valor_base100",
    });

    expect(resultado.map((linha) => linha.data)).toEqual([
      "2014-12-31",
      "2015-01-02",
      "2018-12-26",
    ]);
  });
});
