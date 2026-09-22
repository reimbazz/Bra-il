"""Testes de correlation.py — sempre com DataFrame sintético, nunca contra o banco."""

from datetime import date

import pandas as pd
import pytest

from analysis.correlation import AmostraInsuficiente, calcular_correlacao


def _df_linear(n: int, inclinacao: float = 1.0) -> pd.DataFrame:
    datas = pd.date_range("2020-01-01", periods=n, freq="MS").date
    x = list(range(n))
    y = [inclinacao * valor for valor in x]
    return pd.DataFrame({"mes": datas, "x": x, "y": y})


def test_correlacao_perfeita_positiva():
    df = _df_linear(12, inclinacao=1.0)

    resultado = calcular_correlacao(df, "mes", "x", "y")

    assert resultado.coeficiente_pearson == pytest.approx(1.0)
    assert resultado.tamanho_amostra == 12
    assert resultado.periodo_inicio == date(2020, 1, 1)
    assert resultado.periodo_fim == date(2020, 12, 1)


def test_correlacao_perfeita_negativa():
    df = _df_linear(12, inclinacao=-2.0)

    resultado = calcular_correlacao(df, "mes", "x", "y")

    assert resultado.coeficiente_pearson == pytest.approx(-1.0)


def test_descarta_linhas_com_valor_faltante():
    df = _df_linear(10)
    df.loc[0, "y"] = None
    df.loc[5, "x"] = None

    resultado = calcular_correlacao(df, "mes", "x", "y")

    assert resultado.tamanho_amostra == 8


def test_amostra_insuficiente_levanta_excecao():
    df = _df_linear(2)

    with pytest.raises(AmostraInsuficiente):
        calcular_correlacao(df, "mes", "x", "y")
