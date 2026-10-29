// Datas chegam da API como string ISO ("2026-10-29"). Tudo aqui trabalha
// com essa string direto, sem passar por `new Date()` na hora de formatar
// — evita o dia "voltar um" por causa de fuso horário.

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function partes(dataIso) {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  return { ano, mes, dia };
}

/** "2026-10-29" -> "29 out 2026" (tooltip). */
export function formatarDataCompleta(dataIso) {
  if (!dataIso) return "—";
  const { ano, mes, dia } = partes(dataIso);
  return `${String(dia).padStart(2, "0")} ${MESES[mes - 1]} ${ano}`;
}

/** "2026-09-01" -> "set/2026" (dados mensais). */
export function formatarMesAno(dataIso) {
  if (!dataIso) return "—";
  const { ano, mes } = partes(dataIso);
  return `${MESES[mes - 1]}/${ano}`;
}

/** Diferença em dias entre duas datas ISO. */
export function diasEntre(inicioIso, fimIso) {
  return Math.round((Date.parse(fimIso) - Date.parse(inicioIso)) / MS_POR_DIA);
}

/** Data ISO `meses` meses antes de `dataIso` (mesmo dia, ou o último do mês se não existir). */
export function subtrairMeses(dataIso, meses) {
  const { ano, mes, dia } = partes(dataIso);
  const indiceMes = ano * 12 + (mes - 1) - meses;
  const novoAno = Math.floor(indiceMes / 12);
  const novoMes = (indiceMes % 12) + 1;
  const ultimoDia = new Date(Date.UTC(novoAno, novoMes, 0)).getUTCDate();
  const novoDia = Math.min(dia, ultimoDia);
  return `${novoAno}-${String(novoMes).padStart(2, "0")}-${String(novoDia).padStart(2, "0")}`;
}

/** Início do período "últimos N meses" até `dataMax`, sem passar de `dataMin` (`meses` null = tudo). */
export function inicioDoPeriodo(meses, dataMin, dataMax) {
  if (meses == null) return dataMin;
  const inicio = subtrairMeses(dataMax, meses);
  return inicio < dataMin ? dataMin : inicio;
}

// Passos possíveis entre ticks, do mais fino ao mais grosso. O primeiro que
// deixa no máximo `maxTicks` rótulos é o escolhido.
const PASSOS_EM_MESES = [1, 2, 3, 6, 12, 24, 60];

/**
 * Escolhe ticks "redondos" para o eixo X de uma série diária: primeiro dia
 * com dado de cada mês/trimestre/ano, em vez de datas aleatórias no meio do
 * mês. Em janelas curtas (até ~4 meses) usa dias espaçados igualmente.
 *
 * @returns {{ ticks: string[], formatar: (dataIso: string) => string }}
 */
export function gerarTicksTemporais(datas, maxTicks = 8) {
  if (datas.length === 0) return { ticks: [], formatar: (d) => d };

  const span = diasEntre(datas[0], datas.at(-1));

  if (span <= 120) {
    const passo = Math.max(1, Math.ceil(datas.length / maxTicks));
    const ticks = datas.filter((_, indice) => indice % passo === 0);
    return {
      ticks,
      formatar: (dataIso) => {
        const { mes, dia } = partes(dataIso);
        return `${String(dia).padStart(2, "0")} ${MESES[mes - 1]}`;
      },
    };
  }

  // Primeiro dia com dado de cada mês
  const iniciosDeMes = [];
  let mesAnterior = null;
  for (const dataIso of datas) {
    const chaveMes = dataIso.slice(0, 7);
    if (chaveMes !== mesAnterior) {
      iniciosDeMes.push(dataIso);
      mesAnterior = chaveMes;
    }
  }

  const totalMeses = iniciosDeMes.length;
  const passo = PASSOS_EM_MESES.find((p) => totalMeses / p <= maxTicks) ?? PASSOS_EM_MESES.at(-1);

  // Alinha ao calendário (jan, abr, jul, out para trimestral; jan para anual),
  // não ao primeiro mês da janela — rótulos ficam previsíveis.
  const ticks = iniciosDeMes.filter((dataIso) => {
    const { ano, mes } = partes(dataIso);
    return (ano * 12 + (mes - 1)) % passo === 0;
  });

  const soAno = passo >= 12;
  return {
    ticks,
    formatar: (dataIso) => {
      const { ano, mes } = partes(dataIso);
      return soAno ? String(ano) : `${MESES[mes - 1]}/${String(ano).slice(2)}`;
    },
  };
}
