import "./Spinner.css";

export function Spinner({ rotulo = "Carregando" }) {
  return (
    <div className="spinner-wrap" role="status">
      <div className="spinner" aria-hidden="true" />
      <span className="visually-hidden">{rotulo}</span>
    </div>
  );
}
