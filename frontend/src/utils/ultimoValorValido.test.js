import { describe, expect, it } from "vitest";

import { ultimoValorValido } from "./ultimoValorValido.js";

describe("ultimoValorValido", () => {
  it("pula os nulls do fim (dia sem dado novo publicado)", () => {
    const linhas = [
      { data: "2026-09-19", selic_meta_pct_aa: 14.0 },
      { data: "2026-09-20", selic_meta_pct_aa: null },
      { data: "2026-09-21", selic_meta_pct_aa: null },
    ];

    expect(ultimoValorValido(linhas, "selic_meta_pct_aa")).toBe(14.0);
  });

  it("devolve null se a coluna inteira for nula", () => {
    const linhas = [{ ipca_mensal_pct: null }, { ipca_mensal_pct: null }];

    expect(ultimoValorValido(linhas, "ipca_mensal_pct")).toBeNull();
  });

  it("lista vazia devolve null", () => {
    expect(ultimoValorValido([], "qualquer")).toBeNull();
  });
});
