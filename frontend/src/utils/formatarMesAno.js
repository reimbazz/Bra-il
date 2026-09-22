export function formatarMesAno(dataIso) {
  if (!dataIso) return "—";
  const data = new Date(`${dataIso}T00:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(data);
}
