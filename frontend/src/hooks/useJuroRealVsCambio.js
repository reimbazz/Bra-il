import { useEffect, useState } from "react";

import { buscarJuroRealVsCambio } from "../services/api.js";

/** Busca `marts.mart_juro_real_vs_cambio` (juro real mensal x câmbio de fim de mês). */
export function useJuroRealVsCambio({ dataInicio, dataFim } = {}) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    buscarJuroRealVsCambio({ dataInicio, dataFim })
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
