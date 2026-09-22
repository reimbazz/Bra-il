import { useEffect, useState } from "react";

import { buscarCambioBase100 } from "../services/api.js";

/** Busca `marts.mart_cambio_base100` (USD/EUR/CNY normalizadas à base 100). */
export function useCambioBase100({ moedas, dataInicio, dataFim } = {}) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const chaveMoedas = moedas?.join(",") ?? "";

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    buscarCambioBase100({
      moedas: chaveMoedas ? chaveMoedas.split(",") : undefined,
      dataInicio,
      dataFim,
    })
      .then((resultado) => {
        if (!cancelado) setDados(resultado);
      })
      .catch((erroCapturado) => {
        if (!cancelado) setErro(erroCapturado);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [chaveMoedas, dataInicio, dataFim]);

  return { dados, carregando, erro };
}
