import { useEffect, useState } from "react";

import { buscarPoderDeCompra } from "../services/api.js";

/** Busca `marts.mart_poder_de_compra` (índice de preços acumulado x câmbio de fim de mês). */
export function usePoderDeCompra({ dataInicio, dataFim } = {}) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    buscarPoderDeCompra({ dataInicio, dataFim })
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
  }, [dataInicio, dataFim]);

  return { dados, carregando, erro };
}
