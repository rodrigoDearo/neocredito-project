import { calcularCredito } from './credit.calculator';

describe('calcularCredito', () => {
  it('taxa correta para <= R$5.000 em 6x (1.99%)', () => {
    expect(calcularCredito(3000, 6).taxaJuros).toBe(1.99);
  });
  it('taxa correta para R$5.001-15.000 em 12x (1.89%)', () => {
    expect(calcularCredito(8000, 12).taxaJuros).toBe(1.89);
  });
  it('taxa correta para > R$15.000 em 24x (2.19%)', () => {
    expect(calcularCredito(20000, 24).taxaJuros).toBe(2.19);
  });
  it('limite exato R$5.000 usa tier ate5000', () => {
    expect(calcularCredito(5000, 12).taxaJuros).toBe(2.49);
  });
  it('R$5.001 usa tier 5001a15000', () => {
    expect(calcularCredito(5001, 12).taxaJuros).toBe(1.89);
  });
  it('totalAPagar = valorParcela * numeroParcelas', () => {
    const r = calcularCredito(10000, 12);
    expect(r.totalAPagar).toBeCloseTo(r.valorParcela * 12, 1);
  });
  it('fórmula Price correta para R$1.000/6x/1.99%', () => {
    expect(calcularCredito(1000, 6).valorParcela).toBeCloseTo(176.31, 1);
  });
});
