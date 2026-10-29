-- Roles de privilégio mínimo por consumidor (ADR 0006). Rodar uma vez no
-- SQL Editor do console do Neon, conectado como a role "owner" do projeto.
--
-- ANTES DE RODAR: troque os três placeholders de senha por senhas geradas
-- (ex.: `openssl rand -base64 24`). NUNCA commitar este arquivo com senha
-- real preenchida — troque, rode, e descarte a senha da tela (ela só vive
-- em GitHub Secrets / Vercel Env Vars depois, ver README).
--
-- Idempotente na parte de schema/grants; CREATE ROLE falha se a role já
-- existir (rode só a primeira vez, ou troque para ALTER ROLE ... PASSWORD
-- se for só rotacionar senha).

-- 1) role "ingest" — usada pelo job de ingestão (backend/, GitHub Actions)
-- SELECT em raw.observacoes é necessário mesmo essa role nunca fazendo um
-- SELECT explícito: o Postgres exige SELECT para o UPDATE/ON CONFLICT do
-- upsert conseguir localizar a linha conflitante (descoberto rodando a
-- ingestão de verdade contra o Neon — só INSERT/UPDATE não bastou).
CREATE ROLE ingest WITH LOGIN PASSWORD 'TROCAR_SENHA_INGEST';
GRANT USAGE ON SCHEMA raw TO ingest;
GRANT SELECT, INSERT, UPDATE ON raw.observacoes TO ingest;
GRANT SELECT, INSERT, UPDATE ON raw.checkpoint_ingestao TO ingest;

-- 2) role "dbt_transform" — usada pelo job de dbt (dbt/, GitHub Actions)
-- Precisa de CREATE no banco porque o dbt cria os schemas staging/
-- intermediate/marts sozinho na primeira execução (fase 4 do projeto).
CREATE ROLE dbt_transform WITH LOGIN PASSWORD 'TROCAR_SENHA_DBT';
GRANT USAGE ON SCHEMA raw TO dbt_transform;
GRANT SELECT ON raw.observacoes TO dbt_transform;
GRANT CREATE ON DATABASE neondb TO dbt_transform; -- ajuste "neondb" se o nome do seu banco for outro

-- 3) role "api_readonly" — usada pela API na Vercel (api/) e pela análise
-- local (analysis/), só leitura.
CREATE ROLE api_readonly WITH LOGIN PASSWORD 'TROCAR_SENHA_API';

-- O schema "marts" só existe depois do primeiro `dbt run` (fase 4) — rodar
-- este bloco depois disso, não junto com o CREATE ROLE acima:
-- O SELECT nas tabelas NÃO é concedido aqui: o dbt recria os marts a cada
-- run (materialização "table") e o grant manual some junto. Quem concede é
-- o próprio dbt, via `+grants` em dbt/dbt_project.yml. (Um ALTER DEFAULT
-- PRIVILEGES rodado pela role owner também não cobriria: ele só vale para
-- tabelas criadas pela owner, não pela dbt_transform.)
GRANT USAGE ON SCHEMA marts TO api_readonly;
