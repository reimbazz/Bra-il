-- USD/CNY não vem do Banco Central: é referência do BCE via Frankfurter
-- API, usada só pra compor BRL/CNY em intermediate (ver ADR 0004).
select
    data,
    valor as cambio_usd_cny
from {{ source('raw', 'observacoes') }}
where fonte = 'frankfurter'
  and serie = 'cambio_usd_cny'
