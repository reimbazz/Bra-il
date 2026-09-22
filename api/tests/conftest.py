"""Fixtures compartilhadas dos testes da API — nunca batem no Neon de verdade.

Env vars dummy definidas ANTES de qualquer import de `api.index` (que lê
`Config.from_env()` no nível do módulo) — sem isso, importar o app já
quebraria em CI, onde não existe `.env`. `setdefault` respeita um valor
real já exportado, então isso não atrapalha um teste de fumaça manual
contra o Neon se alguém rodar com o `.env` carregado.
"""

import os

os.environ.setdefault("DATABASE_URL_READONLY", "postgresql://fake:fake@localhost/fake")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5173")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from api.index import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
