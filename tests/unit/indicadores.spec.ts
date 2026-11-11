import { percentualNoPrazo } from '../../src/relatorios/indicadores';

describe('RF05 — percentual de chamados resolvidos no prazo', () => {
  const prazo = new Date('2026-11-10T12:00:00Z');
  it('retorna 0 quando não há chamados resolvidos', () => {
    expect(percentualNoPrazo([])).toBe(0);
  });
  it('calcula com uma casa decimal', () => {
    const lista = [
      { prazoSla: prazo, resolvidoEm: new Date('2026-11-10T10:00:00Z') },
      { prazoSla: prazo, resolvidoEm: new Date('2026-11-10T11:00:00Z') },
      { prazoSla: prazo, resolvidoEm: new Date('2026-11-10T15:00:00Z') },
    ];
    expect(percentualNoPrazo(lista)).toBe(66.7);
  });
  it('resolução exatamente no prazo conta como no prazo', () => {
    expect(percentualNoPrazo([{ prazoSla: prazo, resolvidoEm: prazo }])).toBe(100);
  });
});
