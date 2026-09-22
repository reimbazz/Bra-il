"""Entrypoint único da API — Vercel roteia /api/* pra cá (ver ADR 0005).

CORS, conexão e rotas centralizados aqui de propósito: um arquivo por
endpoint espalharia a configuração de segurança (CORS) em vários lugares.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import Config
from api.routers import indicadores

app = FastAPI(title="Bra$il API")

_config = Config.from_env()

app.add_middleware(
    CORSMiddleware,
    allow_origins=_config.allowed_origins,  # nunca "*" (skill security)
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(indicadores.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    """Healthcheck simples, sem tocar no banco — só confirma que a function está de pé."""
    return {"status": "ok"}
