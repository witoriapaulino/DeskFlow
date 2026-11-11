import { Prioridade, StatusChamado } from '../generated/prisma/client';

/** RN04: prazo de atendimento (SLA) em horas, por prioridade. */
export const HORAS_SLA: Record<Prioridade, number> = {
  CRITICA: 4,
  ALTA: 8,
  MEDIA: 24,
  BAIXA: 72,
};

/** Calcula o prazo de SLA a partir da abertura do chamado. */
export function calcularPrazoSla(abertura: Date, prioridade: Prioridade): Date {
  return new Date(abertura.getTime() + HORAS_SLA[prioridade] * 60 * 60 * 1000);
}

/** RN05: transições de status permitidas. */
export const TRANSICOES: Record<StatusChamado, StatusChamado[]> = {
  ABERTO: ['EM_ATENDIMENTO'],
  EM_ATENDIMENTO: ['RESOLVIDO'],
  RESOLVIDO: ['FECHADO', 'EM_ATENDIMENTO'],
  FECHADO: [],
};

export function transicaoPermitida(de: StatusChamado, para: StatusChamado): boolean {
  return TRANSICOES[de].includes(para);
}

/** Um chamado está com SLA vencido se passou do prazo e ainda não foi resolvido. */
export function slaVencido(prazoSla: Date, resolvidoEm: Date | null, agora: Date = new Date()): boolean {
  return resolvidoEm === null && agora.getTime() > prazoSla.getTime();
}
