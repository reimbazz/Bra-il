export function formatarNumero(valor, casasDecimais = 2) {
  if (valor == null) return null;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor);
}
