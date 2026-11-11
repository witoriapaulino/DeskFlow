import { calcularPrazoSla, HORAS_SLA, slaVencido, transicaoPermitida } from '../../src/chamados/regras';

describe('RN04 — prazo de SLA por prioridade', () => {
  const abertura = new Date('2026-11-10T08:00:00Z');

  it.each(Object.entries(HORAS_SLA))('prioridade %s soma %i horas', (prioridade, horas) => {
    const prazo = calcularPrazoSla(abertura, prioridade as keyof typeof HORAS_SLA);
    expect(prazo.getTime() - abertura.getTime()).toBe(horas * 3600 * 1000);
  });

  it('CRITICA tem o menor prazo e BAIXA o maior', () => {
    expect(HORAS_SLA.CRITICA).toBeLessThan(HORAS_SLA.ALTA);
    expect(HORAS_SLA.BAIXA).toBeGreaterThan(HORAS_SLA.MEDIA);
  });
});

describe('RN05 — transições de status', () => {
  it('permite o fluxo normal ABERTO → EM_ATENDIMENTO → RESOLVIDO → FECHADO', () => {
    expect(transicaoPermitida('ABERTO', 'EM_ATENDIMENTO')).toBe(true);
    expect(transicaoPermitida('EM_ATENDIMENTO', 'RESOLVIDO')).toBe(true);
    expect(transicaoPermitida('RESOLVIDO', 'FECHADO')).toBe(true);
  });

  it('permite reabrir um chamado resolvido', () => {
    expect(transicaoPermitida('RESOLVIDO', 'EM_ATENDIMENTO')).toBe(true);
  });

  it('bloqueia pular etapas e mexer em chamado fechado', () => {
    expect(transicaoPermitida('ABERTO', 'FECHADO')).toBe(false);
    expect(transicaoPermitida('EM_ATENDIMENTO', 'FECHADO')).toBe(false);
    expect(transicaoPermitida('FECHADO', 'ABERTO')).toBe(false);
  });
});

describe('SLA vencido', () => {
  const prazo = new Date('2026-11-10T12:00:00Z');
  it('vence quando passa do prazo sem resolução', () => {
    expect(slaVencido(prazo, null, new Date('2026-11-10T13:00:00Z'))).toBe(true);
  });
  it('não vence antes do prazo', () => {
    expect(slaVencido(prazo, null, new Date('2026-11-10T11:00:00Z'))).toBe(false);
  });
  it('chamado resolvido nunca fica vencido', () => {
    expect(slaVencido(prazo, new Date('2026-11-10T14:00:00Z'), new Date('2026-11-11T00:00:00Z'))).toBe(false);
  });
});
