"""Fixtures compartilhadas dos testes de ingestão — tudo sintético, nunca bate na rede."""

import json
from pathlib import Path
from unittest.mock import MagicMock, Mock

import pytest
import requests

DIRETORIO_FIXTURES = Path(__file__).parent / "fixtures"


def carregar_fixture(nome_arquivo: str) -> dict | list:
    with open(DIRETORIO_FIXTURES / nome_arquivo, encoding="utf-8") as arquivo:
        return json.load(arquivo)


@pytest.fixture
def resposta_http_fake():
    """Fábrica de resposta HTTP falsa, para não depender de rede nos testes."""

    def _construir(corpo_json, status_code: int = 200) -> Mock:
        resposta = Mock()
        resposta.status_code = status_code
        resposta.json.return_value = corpo_json
        if status_code >= 400:
            resposta.raise_for_status.side_effect = requests.HTTPError(f"status {status_code}")
        else:
            resposta.raise_for_status.side_effect = None
        return resposta

    return _construir


@pytest.fixture
def conexao_fake():
    """Conexão Postgres falsa: `conn.cursor()` funciona como context manager,
    sem tocar em rede nem banco. Devolve (conn, cursor) pro teste configurar
    `cursor.fetchone`/`fetchall` e inspecionar `cursor.execute.call_args`.
    """
    cursor = MagicMock()
    conn = MagicMock()
    conn.cursor.return_value.__enter__.return_value = cursor
    conn.cursor.return_value.__exit__.return_value = False
    return conn, cursor
