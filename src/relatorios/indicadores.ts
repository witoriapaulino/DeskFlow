/** RF05 — cálculo do percentual de chamados resolvidos dentro do SLA. */
export function percentualNoPrazo(resolvidos: { prazoSla: Date; resolvidoEm: Date | null }[]): number {
  const comData = resolvidos.filter((c) => c.resolvidoEm !== null);
  if (comData.length === 0) return 0;
  const noPrazo = comData.filter((c) => (c.resolvidoEm as Date).getTime() <= c.prazoSla.getTime()).length;
  return Math.round((noPrazo / comData.length) * 1000) / 10;
}
