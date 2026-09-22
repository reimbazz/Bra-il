"""Testes da validação de faixa plausível (ver skill 03-data-preparation)."""

from datetime import date

import pytest

from backend.ingestion.validators import ValorForaDaFaixa, validar_faixa, validar_observacoes
from backend.shared.schemas import ObservacaoBrutaSgs


def test_validar_faixa_aceita_valor_dentro_do_esperado():
    validar_faixa("selic_meta", 13.75)  # não deve levantar exceção


@pytest.mark.parametrize(
    ("nome_serie", "valor"),
    [
        ("selic_meta", -1.0),
        ("selic_meta", 150.0),
        ("cambio_brl_usd", -5.30),
        ("cambio_brl_usd", 0.0),
    ],
)
def test_validar_faixa_rejeita_valor_implausivel(nome_serie, valor):
    with pytest.raises(ValorForaDaFaixa):
        validar_faixa(nome_serie, valor)


def test_validar_observacoes_identifica_a_data_do_valor_invalido():
    observacoes = [
        ObservacaoBrutaSgs(data=date(2022, 9, 1), valor=13.75),
        ObservacaoBrutaSgs(data=date(2022, 9, 2), valor=-1.0),
    ]

    with pytest.raises(ValorForaDaFaixa, match="2022-09-02"):
        validar_observacoes("selic_meta", observacoes)
