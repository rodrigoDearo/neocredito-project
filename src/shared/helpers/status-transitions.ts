import { Status } from '@prisma/client';

const TRANSICOES: Record<Status, Status[]> = {
  RASCUNHO:   [Status.EM_ANALISE, Status.CANCELADA],
  EM_ANALISE: [Status.APROVADA, Status.REPROVADA, Status.CANCELADA],
  APROVADA:   [],
  REPROVADA:  [],
  CANCELADA:  [],
};

export function isTransicaoValida(atual: Status, destino: Status) {
  return TRANSICOES[atual].includes(destino);
}

export function erroTransicao(atual: Status, destino: Status) {
  const permitidas = TRANSICOES[atual];
  return permitidas.length === 0
    ? `"${atual}" é um estado terminal — nenhuma transição permitida.`
    : `Transição "${atual}" → "${destino}" inválida. Permitidas: ${permitidas.join(', ')}.`;
}
