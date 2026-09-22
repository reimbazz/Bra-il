import { useEffect, useState } from "react";

import { buscarCorrelacao } from "../services/api.js";

/** Busca a correlação de Pearson por moeda (calculada no Postgres, ver api/routers/indicadores.py). */
export function useCorrelacao() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    buscarCorrelacao()
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
  }, []);

  return { dados, carregando, erro };
}
