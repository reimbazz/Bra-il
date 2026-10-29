import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PoderDeCompra } from "./PoderDeCompra.jsx";
import * as api from "../services/api.js";

// ResizeObserver não existe no jsdom — o Recharts (ResponsiveContainer) precisa dele.
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("PoderDeCompra", () => {
  it("converte o nível de preços e o câmbio em 'quanto custa hoje o que custava R$ 100'", async () => {
    vi.spyOn(api, "buscarPoderDeCompra").mockResolvedValue([
      {
        mes: "2015-01-01",
        ipca_mensal_pct: 1.24,
        indice_ipca: 100,
        cambio_brl_usd_fim_de_mes: 2.5,
        cambio_brl_eur_fim_de_mes: 3,
        cambio_brl_cny_fim_de_mes: null,
      },
      {
        mes: "2026-09-01",
        ipca_mensal_pct: 0.82,
        indice_ipca: 187,
        cambio_brl_usd_fim_de_mes: 5,
        cambio_brl_eur_fim_de_mes: 6,
        cambio_brl_cny_fim_de_mes: 0.77,
      },
    ]);

    render(<PoderDeCompra />);

    expect(await screen.findByText(/O que custava R\$ 100 em jan\/2015/)).toBeInTheDocument();
    expect(screen.getByText("187,00")).toBeInTheDocument();
    // Dólar dobrou (2,50 -> 5,00): R$ 100 em dólares viram R$ 200
    expect(screen.getAllByText("200,00")).toHaveLength(2);
    // Yuan sem cotação no mês inicial não vira card com número inventado
    expect(screen.queryByText("Yuan (CNY)", { selector: ".stat-tile__label" })).not.toBeInTheDocument();
  });
});
