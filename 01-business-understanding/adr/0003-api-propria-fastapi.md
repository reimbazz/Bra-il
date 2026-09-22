# ADR 0003: API própria (FastAPI) em vez de Streamlit

Data: 2026-09-17
Status: aceito

## Contexto
A stack de referência da skill `06-deployment` sugeria Streamlit Community
Cloud como forma mais rápida de publicar um dashboard 100% Python, sem
precisar de frontend nem API separados.

## Decisão
Usar React + Vite como frontend, consumindo uma API própria em FastAPI, em
vez de Streamlit.

## Consequências
Fica mais trabalhoso: exige escrever e testar um contrato de API e um
frontend completo, em vez de um dashboard Python pronto. Em troca, fica mais
completo como peça de portfólio full-stack (frontend + backend + dados) e dá
controle total sobre UX. A skill `react-style` passa a se aplicar a todo o
frontend.
