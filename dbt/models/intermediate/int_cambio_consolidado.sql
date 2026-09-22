-- As 3 moedas em formato longo (data, moeda, valor), pra normalização e
-- comparação lado a lado nos marts (skill 04).
with cambio_usd as (
    select data, 'USD' as moeda, cambio_brl_usd as valor
    from {{ ref('stg_cambio_brl_usd') }}
),

cambio_eur as (
    select data, 'EUR' as moeda, cambio_brl_eur as valor
    from {{ ref('stg_cambio_brl_eur') }}
),

cambio_cny as (
    select data, 'CNY' as moeda, cambio_brl_cny as valor
    from {{ ref('int_cambio_brl_cny_cross') }}
)

select * from cambio_usd
union all
select * from cambio_eur
union all
select * from cambio_cny
