"""Correlação de Pearson entre juro real e câmbio (skill 04-modeling).

Cálculo puro: recebe um DataFrame já carregado, nenhuma linha de I/O ou de
plot aqui — isso é o que permite testar com dado sintético (skill
05-evaluation) e reusar o mesmo resultado tanto num script quanto num
notebook de exploração.
"""

from dataclasses import dataclass
from datetime import date

import pandas as pd
from scipy import stats

AMOSTRA_MINIMA = 3


class AmostraInsuficiente(Exception):
    """Menos de `AMOSTRA_MINIMA` observações válidas para calcular correlação."""


@dataclass(frozen=True)
class ResultadoCorrelacao:
    """Coeficiente de Pearson, sempre acompanhado do contexto que dá honestidade a ele.

    A skill 04-modeling exige mostrar tamanho de amostra e período junto de
    qualquer coeficiente — sem isso, o número sozinho é enganoso.
    """

    coeficiente_pearson: float
    p_valor: float
    tamanho_amostra: int
    periodo_inicio: date
    periodo_fim: date


def calcular_correlacao(
    df: pd.DataFrame, coluna_data: str, coluna_x: str, coluna_y: str
) -> ResultadoCorrelacao:
    """Calcula a correlação de Pearson entre duas colunas de um DataFrame.

    Args:
        df: DataFrame já carregado (ver analysis/data_access.py).
        coluna_data: nome da coluna de data, usada só pra reportar o período coberto.
        coluna_x: nome da primeira coluna numérica (ex.: juro_real_mensal_pct).
        coluna_y: nome da segunda coluna numérica (ex.: cambio_brl_usd_fim_de_mes).

    Returns:
        ResultadoCorrelacao com coeficiente, p-valor, tamanho de amostra e período.

    Raises:
        AmostraInsuficiente: se sobrarem menos de `AMOSTRA_MINIMA` linhas
            depois de descartar datas com valor faltante em alguma das colunas.
    """
    dados = df[[coluna_data, coluna_x, coluna_y]].dropna()

    if len(dados) < AMOSTRA_MINIMA:
        raise AmostraInsuficiente(
            f"apenas {len(dados)} observações válidas entre '{coluna_x}' e "
            f"'{coluna_y}' — mínimo de {AMOSTRA_MINIMA} para calcular correlação"
        )

    coeficiente, p_valor = stats.pearsonr(dados[coluna_x], dados[coluna_y])

    return ResultadoCorrelacao(
        coeficiente_pearson=float(coeficiente),
        p_valor=float(p_valor),
        tamanho_amostra=len(dados),
        periodo_inicio=dados[coluna_data].min(),
        periodo_fim=dados[coluna_data].max(),
    )
