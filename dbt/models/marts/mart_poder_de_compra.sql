-- Índice de preços acumulado (IPCA) e câmbio de fim de mês, mês a mês.
-- Alimenta a tela "Poder de Compra": o frontend escolhe o mês inicial e
-- divide cada coluna pelo valor desse mês, respondendo "quanto custa hoje
-- o que custava R$ 100 naquele mês".
--
-- `indice_ipca` = nível de preços no FIM do mês (100 = antes do primeiro
-- mês da série). Câmbio também é de fim de mês, então as duas grandezas
-- ficam no mesmo instante e podem ser comparadas diretamente.
with ipca as (
    select
        data as mes,
        ipca_mensal_pct,
        exp(sum(ln(1 + ipca_mensal_pct / 100)) over (
            order by data rows between unbounded preceding and current row
        )) * 100 as indice_ipca
    from {{ ref('stg_ipca_mensal') }}
)

select
    ipca.mes,
    ipca.ipca_mensal_pct,
    ipca.indice_ipca,
    cambio_usd.valor_fim_de_mes as cambio_brl_usd_fim_de_mes,
    cambio_eur.valor_fim_de_mes as cambio_brl_eur_fim_de_mes,
    cambio_cny.valor_fim_de_mes as cambio_brl_cny_fim_de_mes
from ipca
left join {{ ref('int_cambio_fim_de_mes') }} as cambio_usd
    on ipca.mes = cambio_usd.mes and cambio_usd.moeda = 'USD'
left join {{ ref('int_cambio_fim_de_mes') }} as cambio_eur
    on ipca.mes = cambio_eur.mes and cambio_eur.moeda = 'EUR'
left join {{ ref('int_cambio_fim_de_mes') }} as cambio_cny
    on ipca.mes = cambio_cny.mes and cambio_cny.moeda = 'CNY'
