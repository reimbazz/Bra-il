"""Códigos de série confirmados manualmente no localizador do BC.

Confirmação feita em 2026-09-17 (ver 02-data-understanding/data-dictionary.md):
código chamado via curl na API SGS real e valor conferido contra fato
público conhecido antes de entrar aqui. Nunca adicionar código novo sem
repetir esse processo.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class SerieSgs:
    """Série disponível diretamente na API SGS do Banco Central."""

    nome: str
    codigo: int
    unidade: str


@dataclass(frozen=True)
class SerieFrankfurter:
    """Série obtida na Frankfurter API (usada só onde o BC não publica — ver ADR 0004)."""

    nome: str
    moeda_origem: str
    moeda_destino: str
    unidade: str


SELIC_META = SerieSgs(nome="selic_meta", codigo=432, unidade="pct_aa")
IPCA_MENSAL = SerieSgs(nome="ipca_mensal", codigo=433, unidade="pct")
CAMBIO_BRL_USD = SerieSgs(nome="cambio_brl_usd", codigo=1, unidade="brl")
CAMBIO_BRL_EUR = SerieSgs(nome="cambio_brl_eur", codigo=21619, unidade="brl")

CAMBIO_USD_CNY = SerieFrankfurter(
    nome="cambio_usd_cny", moeda_origem="USD", moeda_destino="CNY", unidade="cny"
)

SERIES_SGS: tuple[SerieSgs, ...] = (SELIC_META, IPCA_MENSAL, CAMBIO_BRL_USD, CAMBIO_BRL_EUR)
SERIES_FRANKFURTER: tuple[SerieFrankfurter, ...] = (CAMBIO_USD_CNY,)
