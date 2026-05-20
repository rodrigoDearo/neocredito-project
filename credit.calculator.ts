
export type ValorTier = 'ate5000' | '5001a15000' | 'acima15000';
export const PARCELAS_VALIDAS = [6, 12, 18, 24, 36] as const;
export type ParcelasValidas = (typeof PARCELAS_VALIDAS)[number];

const TABELA_TAXAS: Record<ValorTier, Record<ParcelasValidas, number>> = {
  'ate5000': { 6: 1.99, 12: 2.49, 18: 2.99, 24: 3.49, 36: 3.99 },
  '5001a15000': { 6: 1.49, 12: 1.89, 18: 2.29, 24: 2.79, 36: 3.29 },
  'acima15000': { 6: 1.09, 12: 1.39, 18: 1.79, 24: 2.19, 36: 2.79 },
};

function getTier(valor: number): ValorTier {
  if (valor <= 5000) return 'ate5000';
  if (valor <= 15000) return '5001a15000';
  return 'acima15000';
}

export function getTaxaJuros(
  valorSolicitado: number,
  numeroParcelas: ParcelasValidas,
): number {
  const tier = getTier(valorSolicitado);
  return TABELA_TAXAS[tier][numeroParcelas];
}

export function calcularValorParcela(
  principal: number,
  taxaMensalPercent: number,
  n: number,
): number {
  const r = taxaMensalPercent / 100;
  const fator = Math.pow(1 + r, n);
  const parcela = (principal * (r * fator)) / (fator - 1);
  return round2(parcela);
}

export function calcularTotalAPagar(
  valorParcela: number,
  numeroParcelas: number,
): number {
  return round2(valorParcela * numeroParcelas);
}

export interface CreditoCalculado {
  taxaJuros: number;
  valorParcela: number;
  totalAPagar: number;
}

export function calcularCredito(
  valorSolicitado: number,
  numeroParcelas: ParcelasValidas,
): CreditoCalculado {
  const taxaJuros = getTaxaJuros(valorSolicitado, numeroParcelas);
  const valorParcela = calcularValorParcela(valorSolicitado, taxaJuros, numeroParcelas);
  const totalAPagar = calcularTotalAPagar(valorParcela, numeroParcelas);
  return { taxaJuros, valorParcela, totalAPagar };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
