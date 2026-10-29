import { inicioDoPeriodo } from "../utils/datas.js";

import "./SeletorPeriodo.css";

const PRESETS = [
  { rotulo: "1M", meses: 1 },
  { rotulo: "3M", meses: 3 },
  { rotulo: "6M", meses: 6 },
  { rotulo: "1A", meses: 12 },
  { rotulo: "2A", meses: 24 },
  { rotulo: "5A", meses: 60 },
  { rotulo: "Tudo", meses: null },
];

/**
 * Atalhos de período + (opcional) intervalo manual de datas. Controlado:
 * quem guarda o período é a página, para o mesmo estado servir também ao
 * zoom por arraste dentro do gráfico.
 */
export function SeletorPeriodo({ dataMin, dataMax, inicio, fim, onChange, datasManuais = false }) {
  function alterarData(campo, valor) {
    // input type="date" fica vazio enquanto a pessoa digita uma data incompleta
    if (!valor || valor < dataMin || valor > dataMax) return;
    const proximo = { inicio, fim, [campo]: valor };
    if (proximo.inicio > proximo.fim) return;
    onChange(proximo);
  }

  return (
    <div className="seletor-periodo">
      <div className="seletor-periodo__presets" role="group" aria-label="Período">
        {PRESETS.map(({ rotulo, meses }) => {
          const inicioPreset = inicioDoPeriodo(meses, dataMin, dataMax);
          const ativo = inicio === inicioPreset && fim === dataMax;
          return (
            <button
              key={rotulo}
              type="button"
              className={ativo ? "seletor-periodo__botao seletor-periodo__botao--ativo" : "seletor-periodo__botao"}
              aria-pressed={ativo}
              onClick={() => onChange({ inicio: inicioPreset, fim: dataMax })}
            >
              {rotulo}
            </button>
          );
        })}
      </div>

      {datasManuais ? (
        <div className="seletor-periodo__datas">
          <label>
            De
            <input
              type="date"
              value={inicio}
              min={dataMin}
              max={fim}
              onChange={(evento) => alterarData("inicio", evento.target.value)}
            />
          </label>
          <label>
            até
            <input
              type="date"
              value={fim}
              min={inicio}
              max={dataMax}
              onChange={(evento) => alterarData("fim", evento.target.value)}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
