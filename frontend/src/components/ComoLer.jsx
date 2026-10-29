/**
 * Caixa "Como ler este gráfico": a explicação fica ao lado do gráfico, não
 * escondida na Metodologia — quem chega numa tela precisa entender o que
 * vê sem trocar de página.
 */
export function ComoLer({ titulo = "Como ler este gráfico", children }) {
  return (
    <aside className="como-ler">
      <strong className="como-ler__titulo">{titulo}</strong>
      <div className="como-ler__corpo">{children}</div>
    </aside>
  );
}
