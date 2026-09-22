-- Visão diária "crua": Selic e câmbio existem por dia útil, IPCA só existe
-- no primeiro dia de cada mês (não é forward-filled aqui de propósito —
-- ver mart_juro_real_vs_cambio para a versão mensal comparável). Alimenta
-- a tela "Visão Geral" do dashboard.
with datas as (
    {{ dbt_utils.date_spine(
        datepart="day",
        start_date="(select min(data) from " ~ ref('stg_selic_meta') ~ ")",
        end_date="(select max(data) + interval '1 day' from " ~ ref('stg_selic_meta') ~ ")"
    ) }}
)

select
    datas.date_day::date as data,
    selic.selic_meta_pct_aa,
    ipca.ipca_mensal_pct,
    usd.cambio_brl_usd,
    eur.cambio_brl_eur,
    cny.cambio_brl_cny
from datas
left join {{ ref('stg_selic_meta') }} as selic on datas.date_day::date = selic.data
left join {{ ref('stg_ipca_mensal') }} as ipca on datas.date_day::date = ipca.data
left join {{ ref('stg_cambio_brl_usd') }} as usd on datas.date_day::date = usd.data
left join {{ ref('stg_cambio_brl_eur') }} as eur on datas.date_day::date = eur.data
left join {{ ref('int_cambio_brl_cny_cross') }} as cny on datas.date_day::date = cny.data
