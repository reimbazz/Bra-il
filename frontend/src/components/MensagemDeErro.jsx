export function MensagemDeErro({ detalhe }) {
  return (
    <div className="card" role="alert" style={{ borderColor: "var(--color-status-critical)" }}>
      <strong style={{ color: "var(--color-status-critical)" }}>Não deu pra carregar os dados.</strong>
      <p style={{ color: "var(--color-text-secondary)", margin: "8px 0 0" }}>
        {detalhe ?? "Tenta de novo em alguns instantes."}
      </p>
    </div>
  );
}
