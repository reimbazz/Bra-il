import { describe, expect, it } from "vitest";

import { rebasearBase100 } from "./rebasearBase100.js";

describe("rebasearBase100", () => {
  it("ancora cada moeda no seu primeiro valor da janela", () => {
    const resultado = rebasearBase100(
      [
        { data: "2026-01-01", USD: 5, EUR: null },
        { data: "2026-01-02", USD: 5.5, EUR: 6 },
        { data: "2026-01-03", USD: 4.5, EUR: 6.6 },
      ],
      ["USD", "EUR"]
    );

    expect(resultado[0]).toEqual({ data: "2026-01-01", USD: 100, EUR: null });
    expect(resultado[1].USD).toBeCloseTo(110);
    expect(resultado[1].EUR).toBeCloseTo(100);
    expect(resultado[2].USD).toBeCloseTo(90);
    expect(resultado[2].EUR).toBeCloseTo(110);
  });

  it("devolve null para moeda sem nenhum valor na janela", () => {
    const resultado = rebasearBase100([{ data: "2026-01-01", CNY: null }], ["CNY"]);

    expect(resultado[0].CNY).toBeNull();
  });
});

describe("rebasearBase100 com ancorarNaPrimeiraLinha", () => {
  it("não ancora série sem valor na primeira linha numa data posterior", () => {
    const resultado = rebasearBase100(
      [
        { data: "2015-01-01", IPCA: 100, CNY: null },
        { data: "2015-02-01", IPCA: 101, CNY: 0.5 },
      ],
      ["IPCA", "CNY"],
      { ancorarNaPrimeiraLinha: true }
    );

    expect(resultado[1].IPCA).toBeCloseTo(101);
    expect(resultado[1].CNY).toBeNull();
  });
});
