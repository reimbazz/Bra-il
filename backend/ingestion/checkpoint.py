"""Ponto de parada da ingestão incremental (ver skill 03-data-preparation).

Guardar a última data processada evita rebuscar o histórico inteiro a cada
execução do cron.
"""

from datetime import date

from psycopg2.extensions import connection as Connection


def obter_ultima_data_processada(conn: Connection, nome_serie: str) -> date | None:
    """Lê a última data já processada com sucesso para uma série.

    Args:
        conn: conexão Postgres aberta.
        nome_serie: nome lógico da série.

    Returns:
        A última data processada, ou None se a série nunca foi ingerida.
    """
    with conn.cursor() as cursor:
        cursor.execute(
            "SELECT ultima_data_processada FROM raw.checkpoint_ingestao WHERE serie = %s",
            (nome_serie,),
        )
        linha = cursor.fetchone()
    return linha[0] if linha else None


def atualizar_checkpoint(conn: Connection, nome_serie: str, ultima_data: date) -> None:
    """Grava a última data processada com sucesso para uma série.

    Args:
        conn: conexão Postgres aberta. O commit é responsabilidade do chamador.
        nome_serie: nome lógico da série.
        ultima_data: data mais recente já ingerida com sucesso.
    """
    with conn.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO raw.checkpoint_ingestao (serie, ultima_data_processada, atualizado_em)
            VALUES (%s, %s, now())
            ON CONFLICT (serie) DO UPDATE
                SET ultima_data_processada = EXCLUDED.ultima_data_processada,
                    atualizado_em = now()
            """,
            (nome_serie, ultima_data),
        )
