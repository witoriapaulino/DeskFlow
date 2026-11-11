import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChamadosService } from '../../src/chamados/chamados.service';
import { PrismaService } from '../../src/prisma/prisma.service';

function prismaFalso() {
  return {
    usuario: { findUnique: jest.fn() },
    chamado: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  };
}

const base = {
  id: 10,
  titulo: 'Sem internet',
  descricao: 'Rede caiu no setor',
  status: 'ABERTO',
  prioridade: 'MEDIA',
  solicitanteId: 1,
  tecnicoId: null,
  prazoSla: new Date(Date.now() + 3600_000),
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  resolvidoEm: null,
};

describe('ChamadosService', () => {
  let prisma: ReturnType<typeof prismaFalso>;
  let service: ChamadosService;

  beforeEach(() => {
    prisma = prismaFalso();
    service = new ChamadosService(prisma as unknown as PrismaService);
  });

  it('RF01: recusa abrir chamado de solicitante inexistente', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    await expect(service.criar({ titulo: 'Teste', descricao: 'Descrição longa' }, 99)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('RF01: abre chamado com prioridade MEDIA e prazo de 24h por padrão', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
    prisma.chamado.create.mockImplementation(async ({ data }) => ({ ...base, ...data }));
    const c = await service.criar({ titulo: 'Teste', descricao: 'Descrição longa' }, 1);
    expect(c.prioridade).toBe('MEDIA');
    expect(c.prazoSla.getTime() - c.criadoEm.getTime()).toBe(24 * 3600 * 1000);
    expect(c.slaVencido).toBe(false);
  });

  it('RF01: devolve 404 para chamado inexistente', async () => {
    prisma.chamado.findUnique.mockResolvedValue(null);
    await expect(service.buscar(123)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('RF02: usuário comum não consulta chamado de outra pessoa', async () => {
    prisma.chamado.findUnique.mockResolvedValue({ ...base, solicitanteId: 2 });
    await expect(service.buscar(10, { id: 1, email: 'a@a', perfil: 'USUARIO' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('RF02: usuário comum lista só os próprios chamados', async () => {
    prisma.chamado.findMany.mockResolvedValue([]);
    await service.listar({}, { id: 7, email: 'a@a', perfil: 'USUARIO' });
    expect(prisma.chamado.findMany.mock.calls[0][0].where.solicitanteId).toBe(7);
  });

  it('RN05: recusa transição de status inválida', async () => {
    prisma.chamado.findUnique.mockResolvedValue(base);
    await expect(service.atualizarStatus(10, 'FECHADO')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('RF03: só atribui a usuário com perfil TECNICO', async () => {
    prisma.chamado.findUnique.mockResolvedValue(base);
    prisma.usuario.findUnique.mockResolvedValue({ id: 3, perfil: 'GESTOR' });
    await expect(service.atribuir(10, { tecnicoId: 3 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('RF03: atribuição recalcula o SLA e coloca em atendimento', async () => {
    prisma.chamado.findUnique.mockResolvedValue(base);
    prisma.usuario.findUnique.mockResolvedValue({ id: 2, perfil: 'TECNICO' });
    prisma.chamado.update.mockImplementation(async ({ data }) => ({ ...base, ...data }));
    const c = await service.atribuir(10, { tecnicoId: 2, prioridade: 'CRITICA' });
    expect(c.status).toBe('EM_ATENDIMENTO');
    expect(c.prazoSla.getTime() - base.criadoEm.getTime()).toBe(4 * 3600 * 1000);
  });
});
