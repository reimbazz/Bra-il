"""Configuração da análise, lida de variáveis de ambiente — nunca hardcoded."""

import os
from dataclasses import dataclass


class ConfiguracaoAusente(Exception):
    """Uma variável de ambiente obrigatória não foi definida."""


@dataclass(frozen=True)
class Config:
    """Configuração necessária para ler os marts do dbt."""

    database_url: str

    @staticmethod
    def from_env() -> "Config":
        """Monta a configuração a partir do ambiente.

        Returns:
            Config com a connection string somente leitura (role `api_readonly`).

        Raises:
            ConfiguracaoAusente: se `DATABASE_URL_READONLY` não estiver definida.
        """
        database_url = os.environ.get("DATABASE_URL_READONLY")
        if not database_url:
            raise ConfiguracaoAusente(
                "DATABASE_URL_READONLY não definida. Copie .env.example para .env "
                "e preencha com a connection string da role api_readonly."
            )
        return Config(database_url=database_url)
