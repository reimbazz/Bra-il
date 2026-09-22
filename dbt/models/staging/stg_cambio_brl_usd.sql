select
    data,
    valor as cambio_brl_usd
from {{ source('raw', 'observacoes') }}
where fonte = 'bcb_sgs'
  and serie = 'cambio_brl_usd'
