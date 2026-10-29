-- Junta juro real mensal com o câmbio de fim de mês de cada moeda, pra
-- permitir correlação juro real x câmbio na mesma granularidade (skill 04).
-- Premissa de fim de mês: ver int_cambio_fim_de_mes. Alimenta o card "Juro
-- real do mês" da Visão Geral e a análise local (analysis/).
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
left join {{ ref('int_cambio_fim_de_mes') }} as cambio_usd
    on juro_real.mes = cambio_usd.mes and cambio_usd.moeda = 'USD'
left join {{ ref('int_cambio_fim_de_mes') }} as cambio_eur
    on juro_real.mes = cambio_eur.mes and cambio_eur.moeda = 'EUR'
left join {{ ref('int_cambio_fim_de_mes') }} as cambio_cny
    on juro_real.mes = cambio_cny.mes and cambio_cny.moeda = 'CNY'
