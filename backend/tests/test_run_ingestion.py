"""Testes de orquestração da ingestão — idempotência e incrementalidade.

Todas as dependências externas (API, banco) são mockadas: este teste cobre
só a lógica de "o que buscar e quando parar", não a integração real.
"""

from datetime import date
from unittest.mock import Mock, patch

from backend.ingestion.run_ingestion import DATA_INICIO_PADRAO, processar_serie_sgs
from backend.shared.schemas import ObservacaoBrutaSgs
from backend.shared.series_codes import SELIC_META


@patch("backend.ingestion.run_ingestion.atualizar_checkpoint")
@patch("backend.ingestion.run_ingestion.upsert_observacoes")
@patch("backend.ingestion.run_ingestion.buscar_serie_sgs")
@patch("backend.ingestion.run_ingestion.obter_ultima_data_processada", return_value=None)
def test_primeira_execucao_usa_data_inicio_padrao(
    obter_checkpoint_mock, buscar_mock, upsert_mock, atualizar_checkpoint_mock
):
    conn = Mock()
    buscar_mock.return_value = [ObservacaoBrutaSgs(data=date(2022, 9, 1), valor=13.75)]

    processar_serie_sgs(conn, SELIC_META, data_fim=date(2022, 9, 1))

    buscar_mock.assert_called_once_with(SELIC_META.codigo, DATA_INICIO_PADRAO, date(2022, 9, 1))
    upsert_mock.assert_called_once()
    atualizar_checkpoint_mock.assert_called_once_with(conn, "selic_meta", date(2022, 9, 1))


@patch("backend.ingestion.run_ingestion.atualizar_checkpoint")
@patch("backend.ingestion.run_ingestion.upsert_observacoes")
@patch("backend.ingestion.run_ingestion.buscar_serie_sgs")
@patch(
    "backend.ingestion.run_ingestion.obter_ultima_data_processada",
    return_value=date(2022, 9, 5),
)
def test_nao_busca_de_novo_quando_ja_esta_em_dia(
    obter_checkpoint_mock, buscar_mock, upsert_mock, atualizar_checkpoint_mock
):
    """Rodar o pipeline 2x no mesmo dia não pode gerar chamada nova nem duplicar registro."""
    conn = Mock()

    processar_serie_sgs(conn, SELIC_META, data_fim=date(2022, 9, 5))

    buscar_mock.assert_not_called()
    upsert_mock.assert_not_called()
    atualizar_checkpoint_mock.assert_not_called()


@patch("backend.ingestion.run_ingestion.atualizar_checkpoint")
@patch("backend.ingestion.run_ingestion.upsert_observacoes")
@patch("backend.ingestion.run_ingestion.buscar_serie_sgs", return_value=[])
@patch(
    "backend.ingestion.run_ingestion.obter_ultima_data_processada",
    return_value=date(2022, 9, 1),
)
def test_nao_atualiza_checkpoint_quando_api_nao_devolve_dado_novo(
    obter_checkpoint_mock, buscar_mock, upsert_mock, atualizar_checkpoint_mock
):
    """Fim de semana/feriado: API não tem cotação nova, checkpoint não deve avançar sozinho."""
    conn = Mock()

    processar_serie_sgs(conn, SELIC_META, data_fim=date(2022, 9, 3))

    upsert_mock.assert_not_called()
    atualizar_checkpoint_mock.assert_not_called()
