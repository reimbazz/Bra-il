"""Leitura dos marts do dbt para análise — só SELECT, role `api_readonly`.

Separado do resto da análise de propósito: cálculo (correlation.py,
regression_lag.py) não deve saber de onde o dado veio, só receber um
DataFrame já pronto (skill 04-modeling).
"""

from decimal import Decimal

import pandas as pd
import psycopg2
from psycopg2.extensions import DECIMAL, new_type, register_type
from psycopg2.extensions import connection as Connection

from analysis.config import Config

# psycopg2 devolve NUMERIC como decimal.Decimal por padrão; sem isso, a
# coluna vira dtype=object no DataFrame e quebra o scipy (pearsonr/
# linregress esperam float). Registrado só na conexão desta função, não
# globalmente — backend/ingestion continua recebendo Decimal exato.
_DEC2FLOAT = new_type(
    DECIMAL.values, "DEC2FLOAT", lambda valor, cursor: float(valor) if valor is not None else None
)


def _converter_decimal_para_float(df: pd.DataFrame) -> pd.DataFrame:
    """Segunda camada de proteção contra `Decimal` sobrando em alguma coluna.

    O `register_type` acima já evita isso na conexão real, mas aquilo só se
    verifica contra um Postgres de verdade — isso aqui é a parte da correção
    que dá pra cobrir com teste sintético (sem banco), então é ela quem
    carrega o teste de regressão do bug (ver analysis/tests/test_data_access.py).
    """
    for coluna in df.columns:
        if df[coluna].map(lambda valor: isinstance(valor, Decimal)).any():
            df[coluna] = df[coluna].astype(float)
    return df


def _ler_query(query: str) -> pd.DataFrame:
    """Roda uma query e devolve DataFrame, sem passar por `pd.read_sql`.

    `pd.read_sql` com uma conexão psycopg2 pura (não SQLAlchemy) está em
    caminho de depreciação no pandas — ler via cursor evita o aviso sem
    precisar adicionar SQLAlchemy como dependência só pra isso.
    """
    config = Config.from_env()
    conn: Connection = psycopg2.connect(config.database_url)
    register_type(_DEC2FLOAT, conn)
    try:
        with conn.cursor() as cursor:
            cursor.execute(query)
            colunas = [coluna.name for coluna in cursor.description]
            linhas = cursor.fetchall()
    finally:
        conn.close()
    return _converter_decimal_para_float(pd.DataFrame(linhas, columns=colunas))


def carregar_juro_real_vs_cambio() -> pd.DataFrame:
    """Lê `marts.mart_juro_real_vs_cambio` inteiro.

    Returns:
        DataFrame com uma linha por mês: juro real e câmbio de fim de mês
        de cada moeda (colunas conforme o schema do mart).
    """
    return _ler_query("SELECT * FROM marts.mart_juro_real_vs_cambio ORDER BY mes")


def carregar_cambio_base100() -> pd.DataFrame:
    """Lê `marts.mart_cambio_base100` inteiro.

    Returns:
        DataFrame em formato longo (data, moeda, valor, valor_base100).
    """
    return _ler_query("SELECT * FROM marts.mart_cambio_base100 ORDER BY moeda, data")


def carregar_indicadores_diarios() -> pd.DataFrame:
    """Lê `marts.mart_indicadores_diarios` inteiro.

    Returns:
        DataFrame diário largo (Selic, IPCA, câmbio x3 — colunas com NULL
        nos dias sem dado novo publicado).
    """
    return _ler_query("SELECT * FROM marts.mart_indicadores_diarios ORDER BY data")
