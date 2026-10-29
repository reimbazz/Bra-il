import { useEffect, useState } from "react";

import { buscarJurosInflacao } from "../services/api.js";

/** Busca `marts.mart_juros_inflacao` (Selic meta x IPCA acumulado em 12 meses). */
export function useJurosInflacao({ dataInicio, dataFim } = {}) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    buscarJurosInflacao({ dataInicio, dataFim })
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
