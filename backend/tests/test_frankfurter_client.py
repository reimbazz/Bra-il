"""Testes do cliente Frankfurter (cross-rate USD/CNY — ver ADR 0004)."""

from datetime import date
from unittest.mock import patch

import pytest
import requests

from backend.ingestion.frankfurter_client import (
    RespostaFrankfurterInvalida,
    buscar_cambio_frankfurter,
)
from backend.tests.conftest import carregar_fixture


@patch("backend.ingestion.frankfurter_client.requests.get")
def test_buscar_cambio_frankfurter_parseia_resposta_valida(get_mock, resposta_http_fake):
    get_mock.return_value = resposta_http_fake(carregar_fixture("frankfurter_usd_cny_valida.json"))

    observacoes = buscar_cambio_frankfurter("USD", "CNY", date(2023, 1, 2), date(2023, 1, 4))

    assert len(observacoes) == 3
    assert observacoes[0].data == date(2023, 1, 2)
    assert observacoes[0].valor == 6.8963
    # precisa vir ordenado por data, mesmo que o dict do JSON não garanta ordem
    assert [observacao.data for observacao in observacoes] == sorted(
        observacao.data for observacao in observacoes
    )


@patch("backend.ingestion.frankfurter_client.requests.get")
def test_buscar_cambio_frankfurter_rejeita_formato_sem_rates(get_mock, resposta_http_fake):
    fixture = carregar_fixture("frankfurter_formato_inesperado.json")
    get_mock.return_value = resposta_http_fake(fixture)

    with pytest.raises(RespostaFrankfurterInvalida):
        buscar_cambio_frankfurter("USD", "CNY", date(2023, 1, 2), date(2023, 1, 4))


@patch("backend.ingestion.frankfurter_client.requests.get")
def test_buscar_cambio_frankfurter_propaga_erro_http(get_mock, resposta_http_fake):
    get_mock.return_value = resposta_http_fake({}, status_code=500)

    with pytest.raises(requests.HTTPError):
        buscar_cambio_frankfurter("USD", "CNY", date(2023, 1, 2), date(2023, 1, 4))
