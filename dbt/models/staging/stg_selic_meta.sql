select
    data,
    valor as selic_meta_pct_aa
from {{ source('raw', 'observacoes') }}
where fonte = 'bcb_sgs'
  and serie = 'selic_meta'
