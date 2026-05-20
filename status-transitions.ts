import { Status } from '@prisma/client';


export const TRANSICOES_PERMITIDAS: Readonly<Record<Status, readonly Status[]>> = {
  [Status.RASCUNHO]: [Status.EM_ANALISE, Status.CANCELADA],
  [Status.EM_ANALISE]: [Status.APROVADA, Status.REPROVADA, Status.CANCELADA],
  [Status.APROVADA]: [],
  [Status.REPROVADA]: [],
  [Status.CANCELADA]: [],
} as const;

export function isTransicaoValida(atual: Status, destino: Status): boolean {
  return (TRANSICOES_PERMITIDAS[atual] as Status[]).includes(destino);
}

export function getMensagemErroTransicao(atual: Status, destino: Status): string {
  const permitidas = TRANSICOES_PERMITIDAS[atual];
  if (permitidas.length === 0) {
    return `Status "${atual}" nao permite transicao.`;
  }
  return (
    `Transicao de "${atual}" para "${destino}" nao e permitida. ` +
    `Transicoes validas a partir de "${atual}": ${permitidas.join(', ')}.`
  );
}
