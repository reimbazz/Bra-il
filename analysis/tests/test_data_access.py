"""Teste de regressão: NUMERIC do Postgres virava Decimal -> dtype=object no
DataFrame -> `scipy.stats.pearsonr` quebrava (ValueError num crash real,
achado rodando run_analysis.py contra o Neon). Conexão mockada — a parte do
fix que depende do driver psycopg2 de verdade (o `register_type`) não dá
pra cobrir sem banco; este teste cobre a camada de proteção em Python puro
que fica por trás dela (ver comentário em data_access.py).
"""

from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from analysis.data_access import _ler_query


@patch("analysis.data_access.register_type")
@patch("analysis.data_access.psycopg2.connect")
@patch("analysis.data_access.Config")
def test_ler_query_converte_decimal_para_float(config_mock, connect_mock, register_type_mock):
    config_mock.from_env.return_value = SimpleNamespace(database_url="postgresql://fake")

    cursor = MagicMock()
    cursor.description = [
        SimpleNamespace(name="mes"),
        SimpleNamespace(name="juro_real_mensal_pct"),
    ]
    cursor.fetchall.return_value = [
        ("2022-09-01", Decimal("1.44")),
        ("2022-10-01", Decimal("0.87")),
    ]
    conn = MagicMock()
    conn.cursor.return_value.__enter__.return_value = cursor
    conn.cursor.return_value.__exit__.return_value = False
    connect_mock.return_value = conn

    df = _ler_query("SELECT 1")

    assert df["juro_real_mensal_pct"].dtype.kind == "f"  # float, não object
    assert df["juro_real_mensal_pct"].tolist() == [1.44, 0.87]


@patch("analysis.data_access.register_type")
@patch("analysis.data_access.psycopg2.connect")
@patch("analysis.data_access.Config")
def test_ler_query_sem_decimal_nao_mexe_nas_colunas(config_mock, connect_mock, register_type_mock):
    config_mock.from_env.return_value = SimpleNamespace(database_url="postgresql://fake")

    cursor = MagicMock()
    cursor.description = [SimpleNamespace(name="moeda")]
    cursor.fetchall.return_value = [("USD",), ("EUR",)]
    conn = MagicMock()
    conn.cursor.return_value.__enter__.return_value = cursor
    conn.cursor.return_value.__exit__.return_value = False
    connect_mock.return_value = conn

    df = _ler_query("SELECT 1")

    assert df["moeda"].tolist() == ["USD", "EUR"]
