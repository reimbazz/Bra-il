"""Persistência das observações brutas — sempre upsert parametrizado, nunca SQL interpolado."""

from psycopg2.extensions import connection as Connection
from psycopg2.extras import execute_values

from backend.shared.schemas import ObservacaoBrutaFrankfurter, ObservacaoBrutaSgs


def upsert_observacoes(
    conn: Connection,
    fonte: str,
    nome_serie: str,
    observacoes: list[ObservacaoBrutaSgs] | list[ObservacaoBrutaFrankfurter],
) -> int:
    """Insere ou atualiza observações em `raw.observacoes`.

    Idempotente por natureza: rodar duas vezes com o mesmo dado não duplica
    linha (chave natural `fonte, serie, data`), só atualiza `valor` e
    `coletado_em` se o BC tiver revisado o dado retroativamente.

    Args:
        conn: conexão Postgres aberta. O commit é responsabilidade do chamador.
        fonte: origem do dado (`"bcb_sgs"` ou `"frankfurter"`).
        nome_serie: nome lógico da série.
        observacoes: observações já validadas (schema e faixa).

    Returns:
        Número de observações enviadas para upsert.
    """
    if not observacoes:
        return 0

    linhas = [(fonte, nome_serie, observacao.data, observacao.valor) for observacao in observacoes]

    with conn.cursor() as cursor:
        execute_values(
            cursor,
            """
            INSERT INTO raw.observacoes (fonte, serie, data, valor)
            VALUES %s
            ON CONFLICT (fonte, serie, data) DO UPDATE
                SET valor = EXCLUDED.valor, coletado_em = now()
            """,
            linhas,
        )

    return len(linhas)
