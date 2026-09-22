# ADR 0006: Roles de banco com privilégio mínimo por consumidor

Data: 2026-09-17
Status: aceito

## Contexto
Três serviços distintos precisam falar com o Neon: o job de ingestão
(Actions), o job de dbt (Actions) e a API pública (Vercel). Usar uma única
connection string de superusuário para os três significaria que um secret
vazado na API pública (o serviço mais exposto, por estar voltado à
internet) daria acesso de escrita a todo o banco.

## Decisão
Criar três roles no Neon com privilégio mínimo por consumidor:
`ingest` (SELECT/INSERT/UPDATE só no schema `raw`), `dbt_transform`
(materializa `staging`/`intermediate`/`marts`) e `api_readonly` (SELECT
apenas em `marts`, via endpoint pooled).

`ingest` precisa de **SELECT**, não só INSERT/UPDATE como planejado
inicialmente — descoberto rodando a ingestão de verdade contra o Neon: o
Postgres exige SELECT na tabela para o `UPDATE`/`ON CONFLICT DO UPDATE` do
upsert conseguir localizar a linha conflitante, mesmo a role nunca
executando um `SELECT` explícito no código Python. "Privilégio mínimo" aqui
significa mínimo necessário para o padrão de upsert escolhido, não
literalmente as duas verbas mais óbvias (INSERT/UPDATE).

## Consequências
Mais setup inicial (criar e conceder permissão a três roles em vez de usar
uma só), mas reduz drasticamente o blast radius de um secret vazado: a
credencial da API pública, se exposta, só permite ler dado que já é
público. SELECT em `raw` para a role `ingest` também significa que, se essa
credencial vazar, quem a obtiver consegue ler o dado bruto (não só
escrever) — aceitável porque o dado da fonte é público, mas vale registrar
que o alcance ficou levemente maior que o desenho original.
