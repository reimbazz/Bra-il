import { useEffect, useState } from "react";

import { buscarIndicadoresDiarios } from "../services/api.js";

/**
 * Busca `marts.mart_indicadores_diarios` (Selic, IPCA, câmbio por dia).
 * Separado da apresentação de propósito (skill react-style): este hook não
 * sabe renderizar nada, só busca e devolve o estado.
 */
export function useIndicadoresDiarios({ dataInicio, dataFim } = {}) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    buscarIndicadoresDiarios({ dataInicio, dataFim })
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
