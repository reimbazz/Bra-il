"""Modelos de resposta da API — um por mart consumido (ver dbt/models/marts/)."""

from datetime import date
from enum import StrEnum

from pydantic import BaseModel


class Moeda(StrEnum):
    """As únicas 3 moedas que o projeto acompanha (ver ADR 0004)."""

    USD = "USD"
    EUR = "EUR"
    CNY = "CNY"


class IndicadorDiario(BaseModel):
    """Uma linha de `marts.mart_indicadores_diarios`.

    IPCA e câmbio vêm `None` nos dias sem dado novo publicado — não é bug,
    é o mart não fazer forward-fill de propósito (ver dbt/README.md).
    """

    data: date
    selic_meta_pct_aa: float | None = None
    ipca_mensal_pct: float | None = None
    cambio_brl_usd: float | None = None
    cambio_brl_eur: float | None = None
    cambio_brl_cny: float | None = None


class CambioBase100(BaseModel):
    """Uma linha de `marts.mart_cambio_base100` (formato longo)."""

    data: date
    moeda: Moeda
    valor: float
    valor_base100: float


class JuroRealVsCambio(BaseModel):
    """Uma linha de `marts.mart_juro_real_vs_cambio`."""

    mes: date
    selic_meta_pct_aa: float
    ipca_mensal_pct: float
    selic_meta_mensal_equivalente_pct: float
    juro_real_mensal_pct: float
    cambio_brl_usd_fim_de_mes: float | None = None
    cambio_brl_eur_fim_de_mes: float | None = None
    cambio_brl_cny_fim_de_mes: float | None = None


class JurosInflacao(BaseModel):
    """Uma linha de `marts.mart_juros_inflacao` — Selic x IPCA 12 meses, ambos % a.a."""

    mes: date
    selic_meta_pct_aa: float
    ipca_mensal_pct: float
    ipca_12m_pct: float
    juro_real_12m_pct: float


class PoderDeCompra(BaseModel):
    """Uma linha de `marts.mart_poder_de_compra` — índice de preços e câmbio no fim do mês."""

    mes: date
    ipca_mensal_pct: float
    indice_ipca: float
    cambio_brl_usd_fim_de_mes: float | None = None
    cambio_brl_eur_fim_de_mes: float | None = None
    cambio_brl_cny_fim_de_mes: float | None = None


class CorrelacaoMoeda(BaseModel):
    """Correlação de Pearson entre juro real mensal e câmbio de fim de mês.

    Calculada via `corr()` nativo do Postgres, não em Python — mantém a
    regra de "cálculo não mora no componente" (skill react-style) sem
    precisar rodar pandas/scipy numa function serverless. Sempre vem com
    tamanho de amostra e período (skill 04-modeling: nunca mostrar
    coeficiente sem esse contexto).
    """

    moeda: Moeda
    coeficiente: float | None
    tamanho_amostra: int
    periodo_inicio: date | None
    periodo_fim: date | None
