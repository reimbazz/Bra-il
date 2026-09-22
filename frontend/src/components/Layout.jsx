import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import "./Layout.css";

const LINKS = [
  { to: "/", rotulo: "Visão Geral", fim: true },
  { to: "/comparacao-moedas", rotulo: "Comparação de Moedas" },
  { to: "/juro-real-x-cambio", rotulo: "Juro Real x Câmbio" },
  { to: "/metodologia", rotulo: "Metodologia" },
];

function lerTemaSalvo() {
  try {
    return localStorage.getItem("bra-il-tema");
  } catch {
    return null;
  }
}

export function Layout() {
  const [tema, setTema] = useState(lerTemaSalvo);

  function alternarTema() {
    const proximo = tema === "dark" ? "light" : "dark";
    setTema(proximo);
    document.documentElement.setAttribute("data-theme", proximo);
    try {
      localStorage.setItem("bra-il-tema", proximo);
    } catch {
      // aba privada ou storage bloqueado — o tema só não persiste entre visitas
    }
  }

  return (
    <>
      <header className="header">
        <div className="container header__conteudo">
          <span className="header__logo">Bra$il</span>
          <nav className="header__nav" aria-label="Navegação principal">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.fim}
                className={({ isActive }) =>
                  isActive ? "header__link header__link--ativo" : "header__link"
                }
              >
                {link.rotulo}
              </NavLink>
            ))}
          </nav>
          <button type="button" className="header__tema" onClick={alternarTema}>
            {tema === "dark" ? "Modo claro" : "Modo escuro"}
          </button>
        </div>
      </header>
      <main className="container main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          Dados: Banco Central do Brasil (SGS) e Frankfurter API, para BRL/CNY
          (ver Metodologia) — não constitui recomendação de investimento.
        </div>
      </footer>
    </>
  );
}
