"""Modelos de dado compartilhados entre ingestão e validação de resposta de API externa."""

from datetime import date

from pydantic import BaseModel, field_validator


class ObservacaoBrutaSgs(BaseModel):
    """Um ponto de uma série da API SGS do Banco Central, já validado e tipado.

    A API SGS devolve `data` e `valor` como string (`DD/MM/AAAA` e número com
    vírgula decimal já convertida para ponto pela API) — este modelo é o
    ponto único onde essa string é validada e convertida.
    """

    data: date
    valor: float

    @field_validator("data", mode="before")
    @classmethod
    def parse_data_brasileira(cls, valor: str | date) -> str | date:
        if isinstance(valor, str):
            dia, mes, ano = valor.split("/")
            return f"{ano}-{mes}-{dia}"
        return valor


class ObservacaoBrutaFrankfurter(BaseModel):
    """Um ponto de câmbio obtido na Frankfurter API (ver ADR 0004)."""

    data: date
    valor: float
