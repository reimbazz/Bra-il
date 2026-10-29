import { describe, expect, it } from "vitest";

import { formatarDataCompleta, gerarTicksTemporais, subtrairMeses } from "./datas.js";

describe("formatarDataCompleta", () => {
  it("formata sem depender de fuso horário", () => {
    expect(formatarDataCompleta("2026-01-01")).toBe("01 jan 2026");
  });
});

describe("subtrairMeses", () => {
  it("cruza a virada de ano", () => {
    expect(subtrairMeses("2026-02-15", 3)).toBe("2025-11-15");
  });

  it("usa o último dia do mês quando o dia não existe", () => {
    expect(subtrairMeses("2026-03-31", 1)).toBe("2026-02-28");
  });
});

describe("gerarTicksTemporais", () => {
  function diasUteis(inicio, quantidade) {
    const datas = [];
    const data = new Date(`${inicio}T00:00:00Z`);
    while (datas.length < quantidade) {
      const diaSemana = data.getUTCDay();
      if (diaSemana !== 0 && diaSemana !== 6) datas.push(data.toISOString().slice(0, 10));
      data.setUTCDate(data.getUTCDate() + 1);
    }
    return datas;
  }

  it("em janela de 2 anos usa o primeiro dia de cada trimestre, rotulado mês/ano", () => {
    const { ticks, formatar } = gerarTicksTemporais(diasUteis("2024-11-01", 520));

    expect(ticks.length).toBeLessThanOrEqual(8);
    expect(ticks.every((t) => ["01", "04", "07", "10"].includes(t.slice(5, 7)))).toBe(true);
    expect(formatar("2025-01-02")).toBe("jan/25");
  });

  it("em janela longa rotula só o ano", () => {
    const { ticks, formatar } = gerarTicksTemporais(diasUteis("2015-01-01", 2900));

    expect(ticks.length).toBeLessThanOrEqual(8);
    expect(formatar(ticks[0])).toMatch(/^\d{4}$/);
  });

  it("em janela curta rotula dia e mês", () => {
    const { formatar } = gerarTicksTemporais(diasUteis("2026-09-01", 40));

    expect(formatar("2026-09-03")).toBe("03 set");
  });
});
