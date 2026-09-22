"""Testes de contrato da API — banco sempre mockado, nunca contra o Neon real."""

from datetime import date
from unittest.mock import patch

from fastapi.testclient import TestClient

from api.index import app


def test_health_nao_toca_no_banco(client: TestClient):
    resposta = client.get("/api/health")

    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok"}


@patch("api.routers.indicadores.executar_query")
def test_indicadores_diarios_caminho_principal(executar_query_mock, client: TestClient):
    executar_query_mock.return_value = [
        {
            "data": "2022-09-01",
            "selic_meta_pct_aa": 13.75,
            "ipca_mensal_pct": -0.36,
            "cambio_brl_usd": 5.18,
            "cambio_brl_eur": 5.15,
            "cambio_brl_cny": 0.75,
        }
    ]

    resposta = client.get("/api/indicadores/diarios")

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert len(corpo) == 1
    assert corpo[0]["selic_meta_pct_aa"] == 13.75


@patch("api.routers.indicadores.executar_query")
def test_indicadores_diarios_repassa_filtro_de_periodo_como_parametro(
    executar_query_mock, client: TestClient
):
    executar_query_mock.return_value = []

    client.get("/api/indicadores/diarios?data_inicio=2022-01-01&data_fim=2022-12-31")

    executar_query_mock.assert_called_once()
    sql, parametros = executar_query_mock.call_args[0]
    assert "WHERE data >= %s AND data <= %s" in sql
    # FastAPI já converte o query param pra date real antes de chegar aqui
    assert parametros == (date(2022, 1, 1), date(2022, 12, 31))
    # nunca interpolar a data recebida do usuário direto na string
    assert "2022-01-01" not in sql


@patch("api.routers.indicadores.executar_query")
def test_cambio_base100_filtra_moeda_valida(executar_query_mock, client: TestClient):
    executar_query_mock.return_value = []

    client.get("/api/cambio/base100?moeda=USD&moeda=EUR")

    sql, parametros = executar_query_mock.call_args[0]
    assert "moeda = ANY(%s)" in sql
    assert parametros == (["USD", "EUR"],)


def test_cambio_base100_rejeita_moeda_invalida(client: TestClient):
    """Moeda fora de USD/EUR/CNY (ver ADR 0004) é erro de validação, não vira query."""
    resposta = client.get("/api/cambio/base100?moeda=GBP")

    assert resposta.status_code == 422


@patch("api.routers.indicadores.executar_query")
def test_juro_real_vs_cambio_caminho_principal(executar_query_mock, client: TestClient):
    executar_query_mock.return_value = [
        {
            "mes": "2022-08-01",
            "selic_meta_pct_aa": 13.75,
            "ipca_mensal_pct": -0.36,
            "selic_meta_mensal_equivalente_pct": 1.08,
            "juro_real_mensal_pct": 1.44,
            "cambio_brl_usd_fim_de_mes": 5.18,
            "cambio_brl_eur_fim_de_mes": None,
            "cambio_brl_cny_fim_de_mes": None,
        }
    ]

    resposta = client.get("/api/juro-real-vs-cambio")

    assert resposta.status_code == 200
    assert resposta.json()[0]["juro_real_mensal_pct"] == 1.44


@patch("api.routers.indicadores.executar_query")
def test_erro_no_banco_nao_vaza_detalhe_da_excecao(executar_query_mock):
    """Caso de erro (skill 05): banco fora do ar não pode virar stack trace pro cliente."""
    executar_query_mock.side_effect = Exception("connection refused: senha-nao-deveria-vazar")

    cliente_sem_relancar = TestClient(app, raise_server_exceptions=False)
    resposta = cliente_sem_relancar.get("/api/indicadores/diarios")

    assert resposta.status_code == 500
    assert "senha-nao-deveria-vazar" not in resposta.text


def test_cors_bloqueia_origem_nao_listada(client: TestClient):
    resposta = client.get("/api/health", headers={"Origin": "https://site-nao-autorizado.com"})

    assert "access-control-allow-origin" not in resposta.headers


def test_cors_libera_origem_permitida(client: TestClient):
    resposta = client.get("/api/health", headers={"Origin": "http://localhost:5173"})

    assert resposta.headers.get("access-control-allow-origin") == "http://localhost:5173"


@patch("api.routers.indicadores.executar_query")
def test_correlacao_roda_uma_query_por_moeda_com_coluna_certa(
    executar_query_mock, client: TestClient
):
    executar_query_mock.return_value = [
        {
            "coeficiente": -0.16,
            "tamanho_amostra": 140,
            "periodo_inicio": "2015-01-01",
            "periodo_fim": "2026-08-01",
        }
    ]

    resposta = client.get("/api/correlacao")

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert [item["moeda"] for item in corpo] == ["USD", "EUR", "CNY"]
    assert executar_query_mock.call_count == 3
    colunas_usadas = [chamada.args[0] for chamada in executar_query_mock.call_args_list]
    assert "cambio_brl_usd_fim_de_mes" in colunas_usadas[0]
    assert "cambio_brl_eur_fim_de_mes" in colunas_usadas[1]
    assert "cambio_brl_cny_fim_de_mes" in colunas_usadas[2]


@patch("api.routers.indicadores.executar_query")
def test_correlacao_aceita_coeficiente_nulo_sem_variancia(executar_query_mock, client: TestClient):
    """corr() do Postgres devolve NULL se não houver variância — não pode quebrar o schema."""
    executar_query_mock.return_value = [
        {"coeficiente": None, "tamanho_amostra": 0, "periodo_inicio": None, "periodo_fim": None}
    ]

    resposta = client.get("/api/correlacao")

    assert resposta.status_code == 200
    assert resposta.json()[0]["coeficiente"] is None
