"""Regressão simples com defasagem temporal (skill 04-modeling, item 3).

Testa se uma variável explicativa (ex.: juro real) "explica" a variável de
resposta (ex.: câmbio) com atraso de N períodos — não confundir com
causalidade (skill 04): um coeficiente alto aqui é só associação defasada.

Premissa: a defasagem é contada em LINHAS do DataFrame recebido, não em
tempo de calendário — para `mart_juro_real_vs_cambio` (uma linha por mês,
sem mês faltante desde que o IPCA seja publicado continuamente), isso
equivale a meses. Cálculo puro, sem I/O nem plot.
"""

from dataclasses import dataclass

import pandas as pd
from scipy import stats

from analysis.correlation import AMOSTRA_MINIMA, AmostraInsuficiente


@dataclass(frozen=True)
class ResultadoRegressaoLag:
    """Resultado de uma regressão linear simples com uma defasagem específica."""

    lag: int
    coeficiente_angular: float
    intercepto: float
    r_valor: float
    p_valor: float
    tamanho_amostra: int


def testar_defasagem(
    df: pd.DataFrame, coluna_explicativa: str, coluna_resposta: str, lags: list[int]
) -> list[ResultadoRegressaoLag]:
    """Roda uma regressão linear simples para cada defasagem pedida.

    Args:
        df: DataFrame já carregado, ordenado por data (ver analysis/data_access.py).
        coluna_explicativa: coluna que é deslocada no tempo (ex.: juro_real_mensal_pct).
        coluna_resposta: coluna que se tenta "explicar" (ex.: câmbio de fim de mês).
        lags: lista de defasagens a testar, em número de linhas (0 = sem defasagem).

    Returns:
        Um `ResultadoRegressaoLag` por defasagem que sobrou com amostra
        suficiente depois do deslocamento (lags maiores descartam mais linhas).

    Raises:
        AmostraInsuficiente: se NENHUMA defasagem testada sobrar com pelo
            menos `AMOSTRA_MINIMA` observações válidas.
    """
    resultados = []

    for lag in lags:
        dados = df[[coluna_explicativa, coluna_resposta]].copy()
        dados[coluna_explicativa] = dados[coluna_explicativa].shift(lag)
        dados = dados.dropna()

        if len(dados) < AMOSTRA_MINIMA:
            continue

        regressao = stats.linregress(dados[coluna_explicativa], dados[coluna_resposta])
        resultados.append(
            ResultadoRegressaoLag(
                lag=lag,
                coeficiente_angular=float(regressao.slope),
                intercepto=float(regressao.intercept),
                r_valor=float(regressao.rvalue),
                p_valor=float(regressao.pvalue),
                tamanho_amostra=len(dados),
            )
        )

    if not resultados:
        raise AmostraInsuficiente(
            f"nenhuma defasagem em {lags} sobrou com {AMOSTRA_MINIMA}+ observações "
            f"válidas entre '{coluna_explicativa}' e '{coluna_resposta}'"
        )

    return resultados
