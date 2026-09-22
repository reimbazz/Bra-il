// Única camada que sabe fazer fetch — hooks chamam essas funções, nunca
// fetch direto num componente (skill react-style).

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

function montarUrl(caminho, parametros) {
  const url = new URL(`${BASE_URL}${caminho}`, window.location.origin);
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor === undefined || valor === null || valor === "") continue;
    if (Array.isArray(valor)) {
      valor.forEach((item) => url.searchParams.append(chave, item));
    } else {
      url.searchParams.set(chave, valor);
    }
  }
  return url.toString();
}

async function buscarJson(caminho, parametros = {}) {
  const resposta = await fetch(montarUrl(caminho, parametros));
  if (!resposta.ok) {
    throw new ErroApi(`Falha ao buscar ${caminho} (status ${resposta.status})`, resposta.status);
  }
  return resposta.json();
}

/** GET /api/indicadores/diarios — Selic, IPCA e câmbio por dia. */
export function buscarIndicadoresDiarios({ dataInicio, dataFim } = {}) {
  return buscarJson("/indicadores/diarios", { data_inicio: dataInicio, data_fim: dataFim });
}

/** GET /api/cambio/base100 — as 3 moedas normalizadas à base 100. */
export function buscarCambioBase100({ moedas, dataInicio, dataFim } = {}) {
  return buscarJson("/cambio/base100", {
    moeda: moedas,
    data_inicio: dataInicio,
    data_fim: dataFim,
  });
}

/** GET /api/juro-real-vs-cambio — juro real mensal x câmbio de fim de mês. */
export function buscarJuroRealVsCambio({ dataInicio, dataFim } = {}) {
  return buscarJson("/juro-real-vs-cambio", { data_inicio: dataInicio, data_fim: dataFim });
}

/** GET /api/correlacao — Pearson (juro real x câmbio) por moeda, calculado no banco. */
export function buscarCorrelacao() {
  return buscarJson("/correlacao", {});
}
