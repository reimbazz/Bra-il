/**
 * Acha o último valor não nulo de uma coluna numa lista já ordenada por
 * data ascendente (como a API sempre devolve). Os marts têm dia sem dado
 * novo publicado de propósito (skill 03/dbt) — pegar "a última linha" sem
 * mais checagem devolveria `null` na maioria das colunas na maior parte do
 * tempo.
 */
export function ultimoValorValido(linhas, chave) {
  for (let indice = linhas.length - 1; indice >= 0; indice -= 1) {
    const valor = linhas[indice][chave];
    if (valor != null) return valor;
  }
  return null;
}
