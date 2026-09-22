"""Testes de regression_lag.py — sempre com DataFrame sintético, nunca contra o banco."""

import random

import pandas as pd
import pytest

from analysis.correlation import AmostraInsuficiente

# import por trás de alias: "testar_defasagem" começa com "test", e o
# pytest tentava coletar o próprio import como um caso de teste.
from analysis.regression_lag import testar_defasagem as calcular_defasagens


def test_identifica_a_defasagem_correta():
    """explicativa é ruído pseudoaleatório com seed fixa (não uma reta nem
    uma senoide — as duas correlacionam fortemente com qualquer defasagem
    delas mesmas, o que mascararia o teste; ruído sem estrutura só
    correlaciona consigo mesmo na defasagem certa). resposta = 2 *
    explicativa, defasada em 3 linhas: só o lag=3 deve recuperar r=1."""
    n = 60
    gerador = random.Random(42)
    explicativa = [gerador.uniform(-1, 1) for _ in range(n)]
    resposta = [None, None, None] + [2 * valor for valor in explicativa[: n - 3]]
    df = pd.DataFrame({"explicativa": explicativa, "resposta": resposta})

    resultados = calcular_defasagens(df, "explicativa", "resposta", lags=[0, 1, 3, 5])
    por_lag = {resultado.lag: resultado for resultado in resultados}

    assert por_lag[3].r_valor == pytest.approx(1.0, abs=1e-9)
    assert por_lag[3].coeficiente_angular == pytest.approx(2.0, abs=1e-9)
    for lag_errado in (0, 1, 5):
        assert abs(por_lag[lag_errado].r_valor) < 0.9


def test_pula_defasagem_sem_amostra_suficiente_mas_mantem_as_outras():
    n = 10
    df = pd.DataFrame({"explicativa": range(n), "resposta": range(n)})

    # lag=9 só deixa 1 linha válida (< AMOSTRA_MINIMA); lag=0 tem 10
    resultados = calcular_defasagens(df, "explicativa", "resposta", lags=[0, 9])

    lags_retornados = [resultado.lag for resultado in resultados]
    assert lags_retornados == [0]


def test_todas_as_defasagens_sem_amostra_levanta_excecao():
    df = pd.DataFrame({"explicativa": range(4), "resposta": range(4)})

    with pytest.raises(AmostraInsuficiente):
        calcular_defasagens(df, "explicativa", "resposta", lags=[3, 4])
