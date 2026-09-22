-- Juro real mensal via Fisher: converte a Selic meta (% a.a.) pro
-- equivalente mensal ANTES de comparar com o IPCA (% mensal) — subtrair
-- Selic a.a. de IPCA mensal direto (como a skill 04 sugere em linguagem
-- solta) misturaria unidades diferentes e daria um número sem sentido.
--
-- Premissa (documentar na tela de Metodologia): usa a Selic meta vigente
-- no ÚLTIMO dia com dado dentro do mês de referência do IPCA. A Selic meta
-- pode mudar em qualquer dia do mês (data de reunião do Copom), não só no
-- fechamento — o valor de fim de mês é a aproximação escolhida aqui.
with selic_fim_de_mes as (
    select distinct on (date_trunc('month', data))
        date_trunc('month', data)::date as mes,
        selic_meta_pct_aa
    from {{ ref('stg_selic_meta') }}
    order by date_trunc('month', data), data desc
),

ipca as (
    select
        data as mes,
        ipca_mensal_pct
    from {{ ref('stg_ipca_mensal') }}
),

calculado as (
    select
        ipca.mes,
        selic.selic_meta_pct_aa,
        ipca.ipca_mensal_pct,
        (power(1 + selic.selic_meta_pct_aa / 100, 1.0 / 12) - 1) * 100
            as selic_meta_mensal_equivalente_pct
    from ipca
    inner join selic_fim_de_mes as selic
        on ipca.mes = selic.mes
)

select
    mes,
    selic_meta_pct_aa,
    ipca_mensal_pct,
    selic_meta_mensal_equivalente_pct,
    (
        (1 + selic_meta_mensal_equivalente_pct / 100)
        / (1 + ipca_mensal_pct / 100)
        - 1
    ) * 100 as juro_real_mensal_pct
from calculado
