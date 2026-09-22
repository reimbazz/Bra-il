"""Cliente da API SGS do Banco Central do Brasil."""

from datetime import date, timedelta

import requests
from pydantic import ValidationError

from backend.shared.schemas import ObservacaoBrutaSgs

BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados"
# 30s não foi suficiente numa janela de vários anos de série diária (timeout
# real observado); 60s dá margem sem deixar um problema de verdade (API fora
# do ar) demorar demais pra falhar.
TIMEOUT_SEGUNDOS = 60

# A API rejeita (HTTP 406) consultas de série diária com janela maior que 10
# anos ("O sistema aceita uma janela de consulta de, no máximo, 10 anos em
# séries de periodicidade diária") — descoberto rodando a ingestão de
# verdade, não documentado antes. 3650 dias fica com margem de segurança
# abaixo do limite real (10 anos de calendário, com anos bissextos, passa
# um pouco de 3650).
MAX_DIAS_POR_JANELA = 3650


class RespostaSgsInvalida(Exception):
    """A API SGS respondeu, mas não no formato esperado (lista de data/valor)."""


def _dividir_em_janelas(data_inicio: date, data_fim: date) -> list[tuple[date, date]]:
    janelas = []
    inicio_janela = data_inicio
    while inicio_janela <= data_fim:
        fim_janela = min(inicio_janela + timedelta(days=MAX_DIAS_POR_JANELA - 1), data_fim)
        janelas.append((inicio_janela, fim_janela))
        inicio_janela = fim_janela + timedelta(days=1)
    return janelas


def _buscar_janela_sgs(codigo: int, data_inicio: date, data_fim: date) -> list[ObservacaoBrutaSgs]:
    resposta = requests.get(
        BASE_URL.format(codigo=codigo),
        params={
            "formato": "json",
            "dataInicial": data_inicio.strftime("%d/%m/%Y"),
            "dataFinal": data_fim.strftime("%d/%m/%Y"),
        },
        timeout=TIMEOUT_SEGUNDOS,
    )
    resposta.raise_for_status()

    try:
        corpo = resposta.json()
    except ValueError as erro:
        raise RespostaSgsInvalida(f"resposta da série {codigo} não é JSON válido") from erro

    if not isinstance(corpo, list):
        raise RespostaSgsInvalida(f"resposta da série {codigo} não é uma lista: {corpo!r}")

    try:
        return [ObservacaoBrutaSgs.model_validate(item) for item in corpo]
    except ValidationError as erro:
        raise RespostaSgsInvalida(
            f"resposta da série {codigo} tem item fora do formato esperado"
        ) from erro


def buscar_serie_sgs(codigo: int, data_inicio: date, data_fim: date) -> list[ObservacaoBrutaSgs]:
    """Busca uma série temporal na API SGS do Banco Central.

    Divide a consulta em janelas de no máximo `MAX_DIAS_POR_JANELA` dias
    internamente, porque a API rejeita janelas de mais de ~10 anos para
    séries diárias — o chamador não precisa saber disso.

    Args:
        codigo: código numérico da série, confirmado previamente no
            localizador do BC (ver backend/shared/series_codes.py).
        data_inicio: primeira data do intervalo, inclusive.
        data_fim: última data do intervalo, inclusive.

    Returns:
        Lista de observações validadas, ordenada por data.

    Raises:
        requests.HTTPError: se a API retornar status de erro.
        RespostaSgsInvalida: se o corpo da resposta não for uma lista de
            objetos com as chaves "data" e "valor".
    """
    observacoes: list[ObservacaoBrutaSgs] = []
    for inicio_janela, fim_janela in _dividir_em_janelas(data_inicio, data_fim):
        observacoes.extend(_buscar_janela_sgs(codigo, inicio_janela, fim_janela))

    # Séries mensais (ex.: IPCA) são indexadas por mês, não por dia: se o
    # corte da janela cai no meio de um mês, a API devolve o registro
    # daquele mês tanto na janela anterior quanto na seguinte. Deduplicar
    # por data evita o "ON CONFLICT DO UPDATE command cannot affect row a
    # second time" no upsert (descoberto rodando a ingestão de verdade).
    observacoes_por_data = {observacao.data: observacao for observacao in observacoes}
    return sorted(observacoes_por_data.values(), key=lambda observacao: observacao.data)
