# ADR 0005: Frontend e API no mesmo projeto Vercel

Data: 2026-09-17
Status: aceito

## Contexto
Com API própria decidida (ADR 0003), era preciso escolher onde hospedá-la:
um backend separado (ex.: Render, Railway) ou junto do frontend na Vercel,
como Serverless Functions Python.

## Decisão
Hospedar a API como Vercel Serverless Functions no mesmo projeto Vercel do
frontend React, servida em `/api/*` do mesmo domínio.

## Consequências
Um serviço a menos para manter, um único lugar de secrets (Vercel Env
Vars) em vez de dois, e nenhum cold start de container hibernando — comum
no free tier de Render/Railway. Em troca, acopla o deploy de frontend e API
num pipeline só (não é possível fazer deploy independente de um sem o
outro), e prende o projeto às limitações de runtime Python de Serverless
Functions da Vercel.
