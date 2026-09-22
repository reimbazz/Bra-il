"""Entrypoint do job de ingestão do GitHub Actions.

Só orquestra: busca, valida e persiste. Nenhuma regra de negócio mora aqui
(ver skill python-style) — isso fica no dbt (staging/intermediate/marts).
"""

from datetime import date, timedelta

import psycopg2
from psycopg2.extensions import connection as Connection

from backend.ingestion.bcb_client import buscar_serie_sgs
from backend.ingestion.checkpoint import atualizar_checkpoint, obter_ultima_data_processada
from backend.ingestion.config import Config
from backend.ingestion.frankfurter_client import buscar_cambio_frankfurter
from backend.ingestion.repository import upsert_observacoes
from backend.ingestion.validators import validar_observacoes
from backend.shared.series_codes import SERIES_FRANKFURTER, SERIES_SGS, SerieFrankfurter, SerieSgs

# Primeira execução (sem checkpoint) busca a partir desta data: histórico
# suficiente para as análises de correlação/normalização sem baixar dado
# desnecessário de décadas atrás logo de cara.
DATA_INICIO_PADRAO = date(2015, 1, 1)

FONTE_BCB_SGS = "bcb_sgs"
FONTE_FRANKFURTER = "frankfurter"


class IngestaoFalhouParcialmente(Exception):
    """Uma ou mais séries falharam durante a ingestão (ver mensagem para detalhes)."""


def _definir_data_inicio(conn: Connection, nome_serie: str) -> date:
    ultima_data_processada = obter_ultima_data_processada(conn, nome_serie)
    if ultima_data_processada is None:
        return DATA_INICIO_PADRAO
    return ultima_data_processada + timedelta(days=1)


def processar_serie_sgs(conn: Connection, serie: SerieSgs, data_fim: date) -> None:
    """Busca, valida e persiste o dado novo de uma série SGS."""
    data_inicio = _definir_data_inicio(conn, serie.nome)
    if data_inicio > data_fim:
        return

    observacoes = buscar_serie_sgs(serie.codigo, data_inicio, data_fim)
    if not observacoes:
        return

    validar_observacoes(serie.nome, observacoes)
    upsert_observacoes(conn, fonte=FONTE_BCB_SGS, nome_serie=serie.nome, observacoes=observacoes)
    atualizar_checkpoint(conn, serie.nome, observacoes[-1].data)


def processar_serie_frankfurter(conn: Connection, serie: SerieFrankfurter, data_fim: date) -> None:
    """Busca, valida e persiste o dado novo de uma série da Frankfurter API."""
    data_inicio = _definir_data_inicio(conn, serie.nome)
    if data_inicio > data_fim:
        return

    observacoes = buscar_cambio_frankfurter(
        serie.moeda_origem, serie.moeda_destino, data_inicio, data_fim
    )
    if not observacoes:
        return

    validar_observacoes(serie.nome, observacoes)
    upsert_observacoes(
        conn, fonte=FONTE_FRANKFURTER, nome_serie=serie.nome, observacoes=observacoes
    )
    atualizar_checkpoint(conn, serie.nome, observacoes[-1].data)


def main() -> None:
    """Ingere todas as séries configuradas. Uma série com erro não impede as demais."""
    config = Config.from_env()
    data_fim = date.today()
    erros: list[str] = []

    conn = psycopg2.connect(config.database_url)
    try:
        for serie_sgs in SERIES_SGS:
            try:
                processar_serie_sgs(conn, serie_sgs, data_fim)
                conn.commit()
            except Exception as erro:  # noqa: BLE001 - erro de uma série não derruba as outras
                conn.rollback()
                erros.append(f"{serie_sgs.nome}: {erro}")

        for serie_frankfurter in SERIES_FRANKFURTER:
            try:
                processar_serie_frankfurter(conn, serie_frankfurter, data_fim)
                conn.commit()
            except Exception as erro:  # noqa: BLE001 - mesmo raciocínio acima
                conn.rollback()
                erros.append(f"{serie_frankfurter.nome}: {erro}")
    finally:
        conn.close()

    if erros:
        raise IngestaoFalhouParcialmente("; ".join(erros))


if __name__ == "__main__":
    main()
