export function isCpfValido(cpf: string): boolean {
  const d = cpf.replace(/[.\-]/g, '');
  if (!/^\d{11}$/.test(d) || /^(\d)\1+$/.test(d)) return false;
  const chk = (pos: number) => {
    const s = d.split('').slice(0, pos).reduce((a, v, i) => a + +v * (pos + 1 - i), 0);
    const r = (s * 10) % 11;
    return (r >= 10 ? 0 : r) === +d[pos];
  };
  return chk(9) && chk(10);
}

export function normalizarCpf(cpf: string): string {
  const d = cpf.replace(/[.\-]/g, '');
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

export function isCpfFormatoValido(cpf: string): boolean {
  return /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/.test(cpf);
}
