import { Injectable } from '@nestjs/common';
import { StatusChamado } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { percentualNoPrazo } from './indicadores';

export interface ResumoAtendimento {
  geradoEm: string;
  total: number;
  porStatus: Record<StatusChamado, number>;
  porTecnico: { tecnicoId: number; nome: string; atribuidos: number; resolvidos: number }[];
  sla: { resolvidos: number; noPrazo: number; percentualNoPrazo: number; vencidosEmAberto: number };
}

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  /** RF05 — painel resumido de atendimento. */
  async resumo(): Promise<ResumoAtendimento> {
    const agora = new Date();
    const [porStatusRaw, porTecnicoRaw, resolvidos, vencidosEmAberto, tecnicos] = await Promise.all([
      this.prisma.chamado.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.chamado.groupBy({ by: ['tecnicoId', 'status'], where: { tecnicoId: { not: null } }, _count: { _all: true } }),
      this.prisma.chamado.findMany({ where: { resolvidoEm: { not: null } }, select: { prazoSla: true, resolvidoEm: true } }),
      this.prisma.chamado.count({ where: { resolvidoEm: null, prazoSla: { lt: agora } } }),
      this.prisma.usuario.findMany({ where: { perfil: 'TECNICO' }, select: { id: true, nome: true } }),
    ]);

    const porStatus: Record<StatusChamado, number> = { ABERTO: 0, EM_ATENDIMENTO: 0, RESOLVIDO: 0, FECHADO: 0 };
    for (const linha of porStatusRaw) porStatus[linha.status] = linha._count._all;

    const porTecnico = tecnicos.map((t) => {
      const linhas = porTecnicoRaw.filter((l) => l.tecnicoId === t.id);
      return {
        tecnicoId: t.id,
        nome: t.nome,
        atribuidos: linhas.reduce((s, l) => s + l._count._all, 0),
        resolvidos: linhas.filter((l) => l.status === 'RESOLVIDO' || l.status === 'FECHADO').reduce((s, l) => s + l._count._all, 0),
      };
    });

    const noPrazo = resolvidos.filter((c) => c.resolvidoEm && c.resolvidoEm.getTime() <= c.prazoSla.getTime()).length;
    return {
      geradoEm: agora.toISOString(),
      total: Object.values(porStatus).reduce((a, b) => a + b, 0),
      porStatus,
      porTecnico,
      sla: { resolvidos: resolvidos.length, noPrazo, percentualNoPrazo: percentualNoPrazo(resolvidos), vencidosEmAberto },
    };
  }
}
