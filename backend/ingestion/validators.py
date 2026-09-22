"""Validação de faixa plausível antes de persistir (ver skill 03-data-preparation).

Um valor fora da faixa nunca deve entrar silenciosamente no banco — é sinal
de série errada, mudança de formato da API externa, ou erro de composição
(caso do BRL/CNY, ver ADR 0004). A validação falha alto (exceção), não
descarta o dado calada.
"""

from backend.shared.schemas import ObservacaoBrutaFrankfurter, ObservacaoBrutaSgs

# (mínimo, máximo) plausíveis por série. Limites documentados aqui, não soltos no código.
# Câmbio nunca pode ser zero ou negativo (regra da skill 03-data-preparation) — o
# mínimo é um epsilon positivo em vez de 0.0 para expressar ">0", não ">=0".
_EPSILON_CAMBIO = 0.0001

FAIXAS_ACEITAS: dict[str, tuple[float, float]] = {
    "selic_meta": (0.0, 100.0),
    "ipca_mensal": (-10.0, 10.0),
    "cambio_brl_usd": (_EPSILON_CAMBIO, 50.0),
    "cambio_brl_eur": (_EPSILON_CAMBIO, 50.0),
    "cambio_usd_cny": (_EPSILON_CAMBIO, 20.0),
}


class ValorForaDaFaixa(Exception):
    """Um valor recebido está fora da faixa plausível para a série."""


def validar_faixa(nome_serie: str, valor: float) -> None:
    """Confere se um valor está dentro da faixa plausível da série.

    Args:
        nome_serie: nome lógico da série (ver backend/shared/series_codes.py).
        valor: valor observado a validar.

    Raises:
        ValorForaDaFaixa: se o valor estiver fora da faixa plausível.
        KeyError: se `nome_serie` não tiver faixa cadastrada em `FAIXAS_ACEITAS`.
    """
    minimo, maximo = FAIXAS_ACEITAS[nome_serie]
    if not (minimo <= valor <= maximo):
        raise ValorForaDaFaixa(
            f"{nome_serie}: valor {valor} fora da faixa plausível [{minimo}, {maximo}]"
        )


def validar_observacoes(
    nome_serie: str,
    observacoes: list[ObservacaoBrutaSgs] | list[ObservacaoBrutaFrankfurter],
) -> None:
    """Valida a faixa de todas as observações de uma série.

    Args:
        nome_serie: nome lógico da série.
        observacoes: observações já parseadas (data e valor tipados).

    Raises:
        ValorForaDaFaixa: na primeira observação fora da faixa plausível,
            com a data incluída na mensagem para facilitar o diagnóstico.
    """
    for observacao in observacoes:
        try:
            validar_faixa(nome_serie, observacao.valor)
        except ValorForaDaFaixa as erro:
            raise ValorForaDaFaixa(f"{erro} (data={observacao.data})") from erro
