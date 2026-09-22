-- Schema "raw" do Neon usado pela ingestão (role "ingest", ver ADR 0006).
-- Rodar uma vez contra o banco antes do primeiro `run_ingestion.py`.
-- Idempotente: seguro rodar de novo.

CREATE SCHEMA IF NOT EXISTS raw;

CREATE TABLE IF NOT EXISTS raw.observacoes (
    fonte text NOT NULL,
    serie text NOT NULL,
    data date NOT NULL,
    valor numeric NOT NULL,
    coletado_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (fonte, serie, data)
);

CREATE TABLE IF NOT EXISTS raw.checkpoint_ingestao (
    serie text PRIMARY KEY,
    ultima_data_processada date NOT NULL,
    atualizado_em timestamptz NOT NULL DEFAULT now()
);
