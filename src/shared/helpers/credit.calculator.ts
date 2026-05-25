export type ParcelasValidas = 6 | 12 | 18 | 24 | 36;
export const PARCELAS_VALIDAS = [6, 12, 18, 24, 36] as const;

const TAXAS: Record<string, Record<number, number>> = {
  ate5000:      { 6: 1.99, 12: 2.49, 18: 2.99, 24: 3.49, 36: 3.99 },
  '5001a15000': { 6: 1.49, 12: 1.89, 18: 2.29, 24: 2.79, 36: 3.29 },
  acima15000:   { 6: 1.09, 12: 1.39, 18: 1.79, 24: 2.19, 36: 2.79 },
};

const r2 = (n: number) => Math.round(n * 100) / 100;

function tier(v: number) {
  if (v <= 5000) return 'ate5000';
  if (v <= 15000) return '5001a15000';
  return 'acima15000';
}

export function calcularCredito(valorSolicitado: number, numeroParcelas: ParcelasValidas) {
  const taxaJuros = TAXAS[tier(valorSolicitado)][numeroParcelas];
  const r = taxaJuros / 100;
  const f = Math.pow(1 + r, numeroParcelas);
  const valorParcela = r2((valorSolicitado * r * f) / (f - 1));
  return { taxaJuros, valorParcela, totalAPagar: r2(valorParcela * numeroParcelas) };
}
