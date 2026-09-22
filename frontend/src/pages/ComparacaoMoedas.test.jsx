import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ComparacaoMoedas } from "./ComparacaoMoedas.jsx";
import * as api from "../services/api.js";

// ResizeObserver não existe no jsdom — o Recharts (ResponsiveContainer) precisa dele.
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("ComparacaoMoedas — os 3 estados que toda tela com fetch precisa tratar", () => {
  it("mostra o spinner enquanto carrega", () => {
    vi.spyOn(api, "buscarCambioBase100").mockReturnValue(new Promise(() => {}));

    render(<ComparacaoMoedas />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("mostra a mensagem de erro quando a busca falha", async () => {
    vi.spyOn(api, "buscarCambioBase100").mockRejectedValue(new Error("falha de rede simulada"));

    render(<ComparacaoMoedas />);

    expect(await screen.findByRole("alert")).toHaveTextContent("falha de rede simulada");
  });

  it("mostra o gráfico quando os dados chegam", async () => {
    vi.spyOn(api, "buscarCambioBase100").mockResolvedValue([
      { data: "2022-01-01", moeda: "USD", valor: 5.5, valor_base100: 100 },
    ]);

    render(<ComparacaoMoedas />);

    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(screen.getByText(/desempenho relativo do Real/)).toBeInTheDocument();
  });
});
