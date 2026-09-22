"""Conexão de leitura com o Neon — role `api_readonly`, somente SELECT nos marts."""

import psycopg2
from psycopg2.extras import RealDictCursor

from api.config import Config


def executar_query(query: str, parametros: tuple = ()) -> list[dict]:
    """Roda uma query somente leitura e devolve as linhas como lista de dicts.

    Uma conexão nova por chamada, de propósito: em ambiente serverless
    (Vercel) cada invocação é isolada, então não há como manter um pool de
    conexão vivo entre requisições — por isso a produção usa o endpoint
    pooled do Neon (`-pooler`), não o direto (ver ADR 0001 e README).

    Args:
        query: SQL com placeholders `%s` — nunca interpolar valor na string.
        parametros: valores para os placeholders da query.

    Returns:
        Uma lista de dicts, uma por linha, com o nome da coluna como chave.
    """
    config = Config.from_env()
    conn = psycopg2.connect(config.database_url)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, parametros)
            return [dict(linha) for linha in cursor.fetchall()]
    finally:
        conn.close()
