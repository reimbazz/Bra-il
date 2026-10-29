// Ícones de traço simples (24x24, herdam a cor do texto via currentColor).
// Desenhados aqui em vez de uma biblioteca: são poucos e só a Metodologia usa.
const DESENHOS = {
  coleta: (
    <>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  banco: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
  verificado: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </>
  ),
  tela: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </>
  ),
  percentual: (
    <>
      <path d="M19 5L5 19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </>
  ),
  carrinho: (
    <>
      <path d="M3 4h2l2.4 11h11.1L21 7H6" />
      <circle cx="9" cy="19.5" r="1.5" />
      <circle cx="18" cy="19.5" r="1.5" />
    </>
  ),
  alta: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  cambio: (
    <>
      <path d="M4 8h13" />
      <path d="M13 4l4 4-4 4" />
      <path d="M20 16H7" />
      <path d="M11 12l-4 4 4 4" />
    </>
  ),
  base: (
    <>
      <path d="M4 4v16h16" />
      <path d="M4 12h16" strokeDasharray="2 3" />
      <path d="M4 12l5-2 4 3 7-7" />
    </>
  ),
  carteira: (
    <>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M16 15h2" />
    </>
  ),
  alerta: (
    <>
      <path d="M12 3.5l9 16H3z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
  codigo: (
    <>
      <path d="M8 6l-6 6 6 6" />
      <path d="M16 6l6 6-6 6" />
    </>
  ),
};

export function Icone({ nome, tamanho = 22 }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {DESENHOS[nome]}
    </svg>
  );
}
