select
    data,
    valor as ipca_mensal_pct
from {{ source('raw', 'observacoes') }}
where fonte = 'bcb_sgs'
  and serie = 'ipca_mensal'
