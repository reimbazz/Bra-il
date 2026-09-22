"""Teste de regressão: a API SGS rejeita (HTTP 406) janelas de série diária
maiores que ~10 anos. Descoberto rodando a ingestão real contra o BC com
DATA_INICIO_PADRAO = 2015-01-01 (mais de 10 anos atrás) — ver bcb_client.py.
"""

from datetime import date
from itertools import pairwise
from unittest.mock import patch

from backend.ingestion.bcb_client import MAX_DIAS_POR_JANELA, _dividir_em_janelas, buscar_serie_sgs
from backend.shared.schemas import ObservacaoBrutaSgs


def test_dividir_em_janelas_nao_excede_o_maximo_de_dias():
    janelas = _dividir_em_janelas(date(2015, 1, 1), date(2026, 9, 21))

    assert len(janelas) > 1
    for inicio, fim in janelas:
        assert (fim - inicio).days < MAX_DIAS_POR_JANELA

    # as janelas cobrem o intervalo inteiro, sem buraco nem sobreposição
    assert janelas[0][0] == date(2015, 1, 1)
    assert janelas[-1][1] == date(2026, 9, 21)
    for (_, fim_atual), (inicio_seguinte, _) in pairwise(janelas):
        assert (inicio_seguinte - fim_atual).days == 1


def test_dividir_em_janelas_intervalo_curto_gera_uma_unica_janela():
    janelas = _dividir_em_janelas(date(2022, 9, 1), date(2022, 9, 5))

    assert janelas == [(date(2022, 9, 1), date(2022, 9, 5))]


@patch("backend.ingestion.bcb_client._buscar_janela_sgs")
def test_buscar_serie_sgs_faz_uma_chamada_por_janela_e_concatena(buscar_janela_mock):
    buscar_janela_mock.side_effect = [
        [ObservacaoBrutaSgs(data=date(2015, 1, 1), valor=1.0)],
        [ObservacaoBrutaSgs(data=date(2026, 9, 21), valor=2.0)],
    ]

    observacoes = buscar_serie_sgs(432, date(2015, 1, 1), date(2026, 9, 21))

    assert buscar_janela_mock.call_count == 2
    assert [observacao.data for observacao in observacoes] == [
        date(2015, 1, 1),
        date(2026, 9, 21),
    ]


@patch("backend.ingestion.bcb_client._dividir_em_janelas")
@patch("backend.ingestion.bcb_client._buscar_janela_sgs")
def test_buscar_serie_sgs_remove_duplicata_de_serie_mensal_no_corte_da_janela(
    buscar_janela_mock, dividir_janelas_mock
):
    """Série mensal (ex.: IPCA) é indexada por mês: se o corte da janela cai
    no meio de um mês, a API devolve o mesmo registro nas duas janelas —
    achado real rodando a ingestão contra o BC (ver comentário em
    bcb_client.py). O upsert não tolera a mesma chave duas vezes no mesmo
    INSERT, então isso tem que virar uma observação só antes de persistir.
    """
    dividir_janelas_mock.return_value = [
        (date(2015, 1, 1), date(2024, 12, 15)),
        (date(2024, 12, 16), date(2026, 9, 21)),
    ]
    buscar_janela_mock.side_effect = [
        [ObservacaoBrutaSgs(data=date(2024, 12, 1), valor=0.52)],
        [  # janela seguinte começa no meio de dezembro, mas a API devolve o mês inteiro de novo
            ObservacaoBrutaSgs(data=date(2024, 12, 1), valor=0.52),
            ObservacaoBrutaSgs(data=date(2025, 1, 1), valor=0.16),
        ],
    ]

    observacoes = buscar_serie_sgs(433, date(2015, 1, 1), date(2026, 9, 21))

    assert [observacao.data for observacao in observacoes] == [
        date(2024, 12, 1),
        date(2025, 1, 1),
    ]
