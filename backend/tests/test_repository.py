"""Testes de repository.py — conexão mockada, nunca contra o Neon real.

Mesma lacuna do test_checkpoint.py: este módulo só tinha verificação manual
contra produção antes da Fase 6.
"""

from datetime import date
from unittest.mock import patch

from backend.ingestion.repository import upsert_observacoes
from backend.shared.schemas import ObservacaoBrutaSgs


def test_upsert_observacoes_com_lista_vazia_nao_toca_no_cursor(conexao_fake):
    conn, cursor = conexao_fake

    resultado = upsert_observacoes(conn, fonte="bcb_sgs", nome_serie="selic_meta", observacoes=[])

    assert resultado == 0
    conn.cursor.assert_not_called()


@patch("backend.ingestion.repository.execute_values")
def test_upsert_observacoes_manda_fonte_serie_data_valor_por_linha(
    execute_values_mock, conexao_fake
):
    conn, cursor = conexao_fake
    observacoes = [
        ObservacaoBrutaSgs(data=date(2022, 9, 1), valor=13.75),
        ObservacaoBrutaSgs(data=date(2022, 9, 2), valor=13.75),
    ]

    resultado = upsert_observacoes(
        conn, fonte="bcb_sgs", nome_serie="selic_meta", observacoes=observacoes
    )

    assert resultado == 2
    execute_values_mock.assert_called_once()
    cursor_usado, sql, linhas = execute_values_mock.call_args[0]
    assert cursor_usado is cursor
    assert linhas == [
        ("bcb_sgs", "selic_meta", date(2022, 9, 1), 13.75),
        ("bcb_sgs", "selic_meta", date(2022, 9, 2), 13.75),
    ]
    assert "ON CONFLICT (fonte, serie, data) DO UPDATE" in sql
    # nunca interpolar fonte/série na string SQL (skill 03-data-preparation)
    assert "bcb_sgs" not in sql
    assert "selic_meta" not in sql
