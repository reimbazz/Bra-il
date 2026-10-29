-- Selic meta x IPCA acumulado em 12 meses, ambos em % ao ano — mesma
-- unidade, então podem dividir o mesmo eixo sem distorção. Alimenta a tela
-- "Juros e Inflação".
--
-- Juro real aqui é a medida simplificada usada no noticiário: a Selic meta
-- vigente no fim do mês descontada (via Fisher) da inflação dos 12 meses
-- anteriores. Não é o juro real "ex-ante" (que usaria inflação esperada) —
-- documentado na tela de Metodologia.
with acumulado as (
    select
        mes,
        selic_meta_pct_aa,
        ipca_mensal_pct,
        -- Produto dos 12 fatores mensais via exp(soma(ln)): inflação composta,
        -- não soma simples das taxas.
        (exp(sum(ln(1 + ipca_mensal_pct / 100)) over janela_12m) - 1) * 100 as ipca_12m_pct,
        -- Janela por intervalo de datas, não por número de linhas: se faltar
        -- um mês no meio, a janela fica incompleta e a linha é descartada
        -- abaixo, em vez de acumular 12 meses espalhados por 13+.
        count(*) over janela_12m as meses_na_janela
    from {{ ref('int_juro_real_mensal') }}
    window janela_12m as (order by mes range between interval '11 months' preceding and current row)
)

select
    mes,
    selic_meta_pct_aa,
    ipca_mensal_pct,
    ipca_12m_pct,
    ((1 + selic_meta_pct_aa / 100) / (1 + ipca_12m_pct / 100) - 1) * 100 as juro_real_12m_pct
from acumulado
where meses_na_janela = 12
