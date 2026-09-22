"""Script de exploração: roda a análise completa e imprime um relatório.

Não faz parte do pipeline automatizado (Actions) — é pra rodar localmente
quando quiser conferir os números antes de expor no dashboard (skill
05-evaluation: "todo número calculado merece checagem manual").
"""

from analysis.correlation import AmostraInsuficiente, calcular_correlacao
from analysis.data_access import carregar_juro_real_vs_cambio
from analysis.regression_lag import testar_defasagem

MOEDAS = ("usd", "eur", "cny")
LAGS_MESES = [0, 1, 2, 3, 6, 12]


def _imprimir_correlacoes(df) -> None:
    print("=== Correlação de Pearson: juro real mensal x câmbio de fim de mês ===")
    for moeda in MOEDAS:
        coluna_cambio = f"cambio_brl_{moeda}_fim_de_mes"
        try:
            resultado = calcular_correlacao(df, "mes", "juro_real_mensal_pct", coluna_cambio)
        except AmostraInsuficiente as erro:
            print(f"{moeda.upper()}: {erro}")
            continue
        print(
            f"{moeda.upper()}: r={resultado.coeficiente_pearson:.3f} "
            f"(p={resultado.p_valor:.3f}, n={resultado.tamanho_amostra}, "
            f"{resultado.periodo_inicio} a {resultado.periodo_fim})"
        )
    print(
        "Aviso: correlação não implica causalidade — leia como 'esteve "
        "associado a', nunca 'causou'.\n"
    )


def _imprimir_defasagens(df) -> None:
    print("=== Regressão com defasagem: juro real explicando câmbio N meses depois ===")
    for moeda in MOEDAS:
        coluna_cambio = f"cambio_brl_{moeda}_fim_de_mes"
        try:
            resultados = testar_defasagem(df, "juro_real_mensal_pct", coluna_cambio, LAGS_MESES)
        except AmostraInsuficiente as erro:
            print(f"{moeda.upper()}: {erro}")
            continue
        print(f"{moeda.upper()}:")
        for resultado in resultados:
            print(
                f"  lag={resultado.lag:>2} meses: r={resultado.r_valor:.3f} "
                f"(p={resultado.p_valor:.3f}, n={resultado.tamanho_amostra})"
            )
    print(
        "\nAviso: mesmo o melhor lag aqui é associação estatística, não "
        "prova de que a Selic/IPCA determina o câmbio."
    )


def main() -> None:
    df = carregar_juro_real_vs_cambio()
    print(f"{len(df)} meses carregados de marts.mart_juro_real_vs_cambio.\n")
    _imprimir_correlacoes(df)
    _imprimir_defasagens(df)


if __name__ == "__main__":
    main()
