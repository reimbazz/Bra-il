-- Câmbio de fim de mês de cada moeda: última cotação disponível dentro do
-- mês. Base comum dos marts mensais (juro real x câmbio, poder de compra),
-- pra premissa de "fim de mês" ser a mesma em todas as telas.
select distinct on (moeda, date_trunc('month', data))
    date_trunc('month', data)::date as mes,
    moeda,
    valor as valor_fim_de_mes
from {{ ref('int_cambio_consolidado') }}
order by moeda, date_trunc('month', data), data desc
