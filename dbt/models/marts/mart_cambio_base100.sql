-- Normaliza cada moeda à base 100 no seu primeiro dia disponível, pra
-- comparar performance relativa do Real no mesmo período (skill 04).
-- Alimenta a tela "Comparação de Moedas".
select
    data,
    moeda,
    valor,
    valor / first_value(valor) over (
        partition by moeda order by data
        rows between unbounded preceding and current row
    ) * 100 as valor_base100
from {{ ref('int_cambio_consolidado') }}
