import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useIndicadoresDiarios } from "./useIndicadoresDiarios.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(corpo, { ok = true, status = 200 } = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(corpo),
    })
  );
}

describe("useIndicadoresDiarios", () => {
  it("começa carregando e depois entrega sucesso", async () => {
    mockFetch([{ data: "2022-09-01", selic_meta_pct_aa: 13.75 }]);

    const { result } = renderHook(() => useIndicadoresDiarios());

    expect(result.current.carregando).toBe(true);
    expect(result.current.dados).toBeNull();

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.erro).toBeNull();
    expect(result.current.dados).toEqual([{ data: "2022-09-01", selic_meta_pct_aa: 13.75 }]);
  });

  it("captura erro quando a API responde com status de falha", async () => {
    mockFetch({}, { ok: false, status: 500 });

    const { result } = renderHook(() => useIndicadoresDiarios());

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.dados).toBeNull();
    expect(result.current.erro).not.toBeNull();
    expect(result.current.erro.message).toMatch(/500/);
  });
});
