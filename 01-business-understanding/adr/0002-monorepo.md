# ADR 0002: Monorepo único

Data: 2026-09-17
Status: aceito

## Contexto
O projeto tem quatro componentes (ingestão, dbt, API, frontend) fortemente
acoplados: todos servem um único produto de portfólio e evoluem juntos.
A alternativa seria multi-repo, com um repositório por componente.

## Decisão
Um único repositório (`Bra-il`), com pastas por responsabilidade
(`backend/`, `dbt/`, `api/`, `frontend/`) e workflows de CI filtrados por
`paths:` para rodar só quando a pasta relevante muda.

## Consequências
Fica mais simples gerenciar sozinho (um só lugar de issues, PRs, histórico).
Fica mais fácil misturar contexto no histórico de commits — mitigado com
Conventional Commits e escopo claro por mudança (ver skill `git-workflow`).
CI precisa de filtro de `paths:` para não rodar tudo a cada alteração
pequena.
