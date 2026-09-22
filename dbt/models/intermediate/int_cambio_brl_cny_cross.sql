-- BRL/CNY não tem PTAX oficial do BC (ver ADR 0004): compõe a partir de
-- BRL/USD (BC) dividido por USD/CNY (Frankfurter). Inner join: só existe
-- linha nas datas em que AMBAS as fontes publicaram cotação — os
-- calendários de feriado do Brasil e da União Europeia não são idênticos,
-- então alguns dias ficam de fora aqui. Expor essa limitação na tela de
-- Metodologia do dashboard, não só neste comentário.
select
    usd.data,
    usd.cambio_brl_usd / cny.cambio_usd_cny as cambio_brl_cny
from {{ ref('stg_cambio_brl_usd') }} as usd
inner join {{ ref('stg_cambio_usd_cny') }} as cny
    on usd.data = cny.data
