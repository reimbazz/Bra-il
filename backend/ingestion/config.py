"""Configuração da ingestão, lida de variáveis de ambiente — nunca hardcoded."""

import os
from dataclasses import dataclass


class ConfiguracaoAusente(Exception):
    """Uma variável de ambiente obrigatória não foi definida."""


@dataclass(frozen=True)
class Config:
    """Configuração necessária para rodar a ingestão."""

    database_url: str

    @staticmethod
    def from_env() -> "Config":
        """Monta a configuração a partir do ambiente.

        Returns:
            Config com a connection string do Neon usada pelo job de ingestão.

        Raises:
            ConfiguracaoAusente: se `NEON_DATABASE_URL_INGEST` não estiver definida.
        """
        database_url = os.environ.get("NEON_DATABASE_URL_INGEST")
        if not database_url:
            raise ConfiguracaoAusente(
                "NEON_DATABASE_URL_INGEST não definida. Copie .env.example para .env "
                "e preencha com a connection string do Neon de desenvolvimento."
            )
        return Config(database_url=database_url)
