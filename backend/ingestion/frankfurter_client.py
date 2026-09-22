"""Cliente da Frankfurter API — usada só para o cross-rate USD/CNY (ver ADR 0004).

O Banco Central não publica cotação oficial de BRL/CNY (nem SGS, nem PTAX -
ver 02-data-understanding/data-dictionary.md). Este cliente busca só o par
USD/CNY; a composição para BRL/CNY é lógica de negócio e mora no dbt
(camada intermediate), não aqui.
"""

from datetime import date

import requests

from backend.shared.schemas import ObservacaoBrutaFrankfurter

BASE_URL = "https://api.frankfurter.app/{data_inicio}..{data_fim}"
TIMEOUT_SEGUNDOS = 30


class RespostaFrankfurterInvalida(Exception):
    """A Frankfurter API respondeu, mas não no formato esperado."""


def buscar_cambio_frankfurter(
    moeda_origem: str, moeda_destino: str, data_inicio: date, data_fim: date
) -> list[ObservacaoBrutaFrankfurter]:
    """Busca um cross-rate histórico na Frankfurter API (referência do BCE).

    Args:
        moeda_origem: código ISO da moeda base (ex.: "USD").
        moeda_destino: código ISO da moeda de destino (ex.: "CNY").
        data_inicio: primeira data do intervalo, inclusive.
        data_fim: última data do intervalo, inclusive.

    Returns:
        Lista de observações validadas. Pode vir vazia se não houver
        pregão do BCE no intervalo pedido (ex.: fim de semana).

    Raises:
        requests.HTTPError: se a API retornar status de erro.
        RespostaFrankfurterInvalida: se o corpo da resposta não tiver o
            formato esperado (objeto com chave "rates").
    """
    resposta = requests.get(
        BASE_URL.format(
            data_inicio=data_inicio.isoformat(),
            data_fim=data_fim.isoformat(),
        ),
        params={"from": moeda_origem, "to": moeda_destino},
        timeout=TIMEOUT_SEGUNDOS,
    )
    resposta.raise_for_status()

    try:
        corpo = resposta.json()
    except ValueError as erro:
        raise RespostaFrankfurterInvalida("resposta não é JSON válido") from erro

    if not isinstance(corpo, dict) or "rates" not in corpo:
        raise RespostaFrankfurterInvalida(f"resposta sem a chave 'rates': {corpo!r}")

    observacoes = []
    for data_str, cotacoes_do_dia in corpo["rates"].items():
        if moeda_destino not in cotacoes_do_dia:
            raise RespostaFrankfurterInvalida(
                f"dia {data_str} não tem cotação de {moeda_destino}: {cotacoes_do_dia!r}"
            )
        observacoes.append(
            ObservacaoBrutaFrankfurter(data=data_str, valor=cotacoes_do_dia[moeda_destino])
        )

    return sorted(observacoes, key=lambda observacao: observacao.data)
