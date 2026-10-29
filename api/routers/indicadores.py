"""Endpoints somente leitura consumidos pelo frontend — um por mart."""

from datetime import date

from fastapi import APIRouter, Query

from api.db import executar_query
from api.schemas import (
    CambioBase100,
    CorrelacaoMoeda,
    IndicadorDiario,
    JuroRealVsCambio,
    JurosInflacao,
    Moeda,
    PoderDeCompra,
)

router = APIRouter(prefix="/api")

# Nomes de coluna fixos, nunca vindos de request — moeda já chega validada
# pelo enum antes de qualquer lookup aqui, então não tem risco de injeção
# ao interpolar o nome da coluna na query (psycopg2 só parametriza valor,
# não identificador).
_COLUNA_CAMBIO_POR_MOEDA: dict[Moeda, str] = {
    Moeda.USD: "cambio_brl_usd_fim_de_mes",
    Moeda.EUR: "cambio_brl_eur_fim_de_mes",
    Moeda.CNY: "cambio_brl_cny_fim_de_mes",
}


def _construir_filtro(
    coluna_data: str,
    data_inicio: date | None,
    data_fim: date | None,
    moedas: list[str] | None = None,
) -> tuple[str, list]:
    """Monta a cláusula WHERE e os parâmetros correspondentes.

    Nunca interpola valor na string SQL — os filtros viram placeholders
    `%s`, os valores vão como parâmetro (skill 03-data-preparation).
    """
    clausulas = []
    parametros: list = []

    if data_inicio is not None:
        clausulas.append(f"{coluna_data} >= %s")
        parametros.append(data_inicio)
    if data_fim is not None:
        clausulas.append(f"{coluna_data} <= %s")
        parametros.append(data_fim)
    if moedas:
        clausulas.append("moeda = ANY(%s)")
        parametros.append(moedas)

    if not clausulas:
        return "", parametros
    return " WHERE " + " AND ".join(clausulas), parametros


@router.get("/indicadores/diarios", response_model=list[IndicadorDiario])
def listar_indicadores_diarios(
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
) -> list[IndicadorDiario]:
    """Selic, IPCA e câmbio diários — alimenta a tela Visão Geral."""
    where, parametros = _construir_filtro("data", data_inicio, data_fim)
    linhas = executar_query(
        f"SELECT * FROM marts.mart_indicadores_diarios{where} ORDER BY data",
        tuple(parametros),
    )
    return [IndicadorDiario(**linha) for linha in linhas]


@router.get("/cambio/base100", response_model=list[CambioBase100])
def listar_cambio_base100(
    moeda: list[Moeda] | None = Query(default=None),
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
) -> list[CambioBase100]:
    """As 3 moedas normalizadas à base 100 — alimenta a tela Comparação de Moedas."""
    moedas = [m.value for m in moeda] if moeda else None
    where, parametros = _construir_filtro("data", data_inicio, data_fim, moedas)
    linhas = executar_query(
        f"SELECT * FROM marts.mart_cambio_base100{where} ORDER BY moeda, data",
        tuple(parametros),
    )
    return [CambioBase100(**linha) for linha in linhas]


@router.get("/juro-real-vs-cambio", response_model=list[JuroRealVsCambio])
def listar_juro_real_vs_cambio(
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
) -> list[JuroRealVsCambio]:
    """Juro real mensal x câmbio de fim de mês — alimenta a tela Juro Real x Câmbio."""
    where, parametros = _construir_filtro("mes", data_inicio, data_fim)
    linhas = executar_query(
        f"SELECT * FROM marts.mart_juro_real_vs_cambio{where} ORDER BY mes",
        tuple(parametros),
    )
    return [JuroRealVsCambio(**linha) for linha in linhas]


@router.get("/juros-inflacao", response_model=list[JurosInflacao])
def listar_juros_inflacao(
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
) -> list[JurosInflacao]:
    """Selic meta x IPCA acumulado em 12 meses — alimenta a tela Juros e Inflação."""
    where, parametros = _construir_filtro("mes", data_inicio, data_fim)
    linhas = executar_query(
        f"SELECT * FROM marts.mart_juros_inflacao{where} ORDER BY mes",
        tuple(parametros),
    )
    return [JurosInflacao(**linha) for linha in linhas]


@router.get("/poder-de-compra", response_model=list[PoderDeCompra])
def listar_poder_de_compra(
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
) -> list[PoderDeCompra]:
    """Índice de preços acumulado x câmbio de fim de mês — alimenta a tela Poder de Compra."""
    where, parametros = _construir_filtro("mes", data_inicio, data_fim)
    linhas = executar_query(
        f"SELECT * FROM marts.mart_poder_de_compra{where} ORDER BY mes",
        tuple(parametros),
    )
    return [PoderDeCompra(**linha) for linha in linhas]


@router.get("/correlacao", response_model=list[CorrelacaoMoeda])
def listar_correlacao() -> list[CorrelacaoMoeda]:
    """Pearson entre juro real mensal e câmbio de fim de mês, por moeda.

    Usa o agregado `corr()` nativo do Postgres em vez de recalcular em
    Python — evita rodar pandas/scipy numa function serverless só pra
    repetir um cálculo que o próprio banco já faz (ver `analysis/correlation.py`
    para a versão de exploração local, mais rica em estatística).
    """
    resultados = []
    for moeda, coluna_cambio in _COLUNA_CAMBIO_POR_MOEDA.items():
        linhas = executar_query(f"""
            SELECT
                corr(juro_real_mensal_pct, {coluna_cambio}) AS coeficiente,
                count(*) AS tamanho_amostra,
                min(mes) AS periodo_inicio,
                max(mes) AS periodo_fim
            FROM marts.mart_juro_real_vs_cambio
            WHERE juro_real_mensal_pct IS NOT NULL AND {coluna_cambio} IS NOT NULL
            """)
        resultados.append(CorrelacaoMoeda(moeda=moeda, **linhas[0]))
    return resultados
