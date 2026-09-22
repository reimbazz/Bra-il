"""Testes de checkpoint.py — conexão mockada, nunca contra o Neon real.

Antes da Fase 6 este módulo só tinha verificação manual (rodei contra o
banco de verdade), sem nenhum teste automatizado — a suíte passava sem
cobrir esse caminho. Fechando a lacuna que a skill 05-evaluation pede.
"""

from datetime import date

from backend.ingestion.checkpoint import atualizar_checkpoint, obter_ultima_data_processada


def test_obter_ultima_data_processada_devolve_none_quando_nunca_ingerido(conexao_fake):
    conn, cursor = conexao_fake
    cursor.fetchone.return_value = None

    resultado = obter_ultima_data_processada(conn, "selic_meta")

    assert resultado is None
    cursor.execute.assert_called_once()
    _sql, parametros = cursor.execute.call_args[0]
    assert parametros == ("selic_meta",)


def test_obter_ultima_data_processada_devolve_a_data_gravada(conexao_fake):
    conn, cursor = conexao_fake
    cursor.fetchone.return_value = (date(2022, 9, 5),)

    resultado = obter_ultima_data_processada(conn, "selic_meta")

    assert resultado == date(2022, 9, 5)


def test_atualizar_checkpoint_manda_serie_e_data_como_parametro(conexao_fake):
    conn, cursor = conexao_fake

    atualizar_checkpoint(conn, "ipca_mensal", date(2026, 8, 1))

    cursor.execute.assert_called_once()
    sql, parametros = cursor.execute.call_args[0]
    assert parametros == ("ipca_mensal", date(2026, 8, 1))
    # nunca interpolar valor na string SQL (skill 03-data-preparation)
    assert "ipca_mensal" not in sql
    assert "ON CONFLICT" in sql
