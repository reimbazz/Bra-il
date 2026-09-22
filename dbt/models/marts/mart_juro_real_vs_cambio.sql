-- Junta juro real mensal com o câmbio de fim de mês de cada moeda, pra
-- permitir correlação juro real x câmbio na mesma granularidade (skill 04).
-- Premissa: câmbio de fim de mês = última cotação disponível dentro do
-- mês. Alimenta a tela "Juro Real x Câmbio".
with cambio_fim_de_mes as (
    select distinct on (moeda, date_trunc('month', data))
        date_trunc('month', data)::date as mes,
        moeda,
        valor as valor_fim_de_mes
    from {{ ref('int_cambio_consolidado') }}
    order by moeda, date_trunc('month', data), data desc
)

select
    juro_real.mes,
    juro_real.selic_meta_pct_aa,
    juro_real.ipca_mensal_pct,
    juro_real.selic_meta_mensal_equivalente_pct,
    juro_real.juro_real_mensal_pct,
    cambio_usd.valor_fim_de_mes as cambio_brl_usd_fim_de_mes,
    cambio_eur.valor_fim_de_mes as cambio_brl_eur_fim_de_mes,
    cambio_cny.valor_fim_de_mes as cambio_brl_cny_fim_de_mes
from {{ ref('int_juro_real_mensal') }} as juro_real
left join cambio_fim_de_mes as cambio_usd
    on juro_real.mes = cambio_usd.mes and cambio_usd.moeda = 'USD'
left join cambio_fim_de_mes as cambio_eur
    on juro_real.mes = cambio_eur.mes and cambio_eur.moeda = 'EUR'
left join cambio_fim_de_mes as cambio_cny
    on juro_real.mes = cambio_cny.mes and cambio_cny.moeda = 'CNY'
