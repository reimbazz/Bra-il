"""Testes do cliente SGS — sempre com fixture sintética, nunca contra a API real."""

from datetime import date
from unittest.mock import patch

import pytest
import requests

from backend.ingestion.bcb_client import RespostaSgsInvalida, buscar_serie_sgs
from backend.tests.conftest import carregar_fixture


@patch("backend.ingestion.bcb_client.requests.get")
def test_buscar_serie_sgs_parseia_resposta_valida(get_mock, resposta_http_fake):
    get_mock.return_value = resposta_http_fake(carregar_fixture("bcb_selic_valida.json"))

    observacoes = buscar_serie_sgs(432, date(2022, 9, 1), date(2022, 9, 5))

    assert len(observacoes) == 3
    assert observacoes[0].data == date(2022, 9, 1)
    assert observacoes[0].valor == 13.75


@patch("backend.ingestion.bcb_client.requests.get")
def test_buscar_serie_sgs_rejeita_formato_inesperado(get_mock, resposta_http_fake):
    get_mock.return_value = resposta_http_fake(carregar_fixture("bcb_formato_inesperado.json"))

    with pytest.raises(RespostaSgsInvalida):
        buscar_serie_sgs(432, date(2022, 9, 1), date(2022, 9, 5))


@patch("backend.ingestion.bcb_client.requests.get")
def test_buscar_serie_sgs_propaga_erro_http(get_mock, resposta_http_fake):
    get_mock.return_value = resposta_http_fake({}, status_code=503)

    with pytest.raises(requests.HTTPError):
        buscar_serie_sgs(432, date(2022, 9, 1), date(2022, 9, 5))
