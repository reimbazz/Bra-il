# ADR 0001: Neon Postgres como banco de dados

Data: 2026-09-17
Status: aceito

## Contexto
O projeto precisa de um Postgres gratuito e permanente para guardar dados
brutos e transformados da API SGS do Banco Central. As opções de referência
da skill `06-deployment` eram Neon e Supabase.

## Decisão
Usar Neon: Postgres serverless com autoscaling, tier gratuito permanente sem
cartão de crédito, e branching de banco (útil para isolar ambientes de
preview/dev sem duplicar dado manualmente).

## Consequências
Fica mais fácil isolar ambientes via branches do Neon. Fica mais difícil (e
exige atenção) o gerenciamento de conexões em ambiente serverless — a API na
Vercel precisa usar o endpoint pooled (`-pooler`), não o direto, para não
esgotar o limite de conexões simultâneas do tier gratuito.
