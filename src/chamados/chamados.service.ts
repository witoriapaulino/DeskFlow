import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Chamado, Perfil, Prisma, StatusChamado } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AtribuirChamadoDto } from './dto/atribuir-chamado.dto';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { FiltroChamadosDto } from './dto/filtro-chamados.dto';
import { calcularPrazoSla, slaVencido, transicaoPermitida } from './regras';

export type ChamadoComSla = Chamado & { slaVencido: boolean };

@Injectable()
export class ChamadosService {
  constructor(private readonly prisma: PrismaService) {}

  private comSla(chamado: Chamado): ChamadoComSla {
    return { ...chamado, slaVencido: slaVencido(chamado.prazoSla, chamado.resolvidoEm) };
  }

  /** RF01 — abrir chamado. */
  async criar(dto: CriarChamadoDto): Promise<ChamadoComSla> {
    const solicitante = await this.prisma.usuario.findUnique({ where: { id: dto.solicitanteId } });
    if (!solicitante) throw new BadRequestException('Solicitante não encontrado');
    const prioridade = dto.prioridade ?? 'MEDIA';
    const agora = new Date();
    const chamado = await this.prisma.chamado.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        prioridade,
        solicitanteId: dto.solicitanteId,
        criadoEm: agora,
        prazoSla: calcularPrazoSla(agora, prioridade),
      },
    });
    return this.comSla(chamado);
  }

  /** RF01 — listar chamados com filtros. */
  async listar(filtro: FiltroChamadosDto): Promise<ChamadoComSla[]> {
    const where: Prisma.ChamadoWhereInput = {};
    if (filtro.status) where.status = filtro.status;
    if (filtro.tecnicoId) where.tecnicoId = filtro.tecnicoId;
    if (filtro.slaVencido) {
      where.resolvidoEm = null;
      where.prazoSla = { lt: new Date() };
    }
    const chamados = await this.prisma.chamado.findMany({ where, orderBy: { criadoEm: 'desc' } });
    return chamados.map((c) => this.comSla(c));
  }

  /** RF01 — consultar um chamado. */
  async buscar(id: number): Promise<ChamadoComSla> {
    const chamado = await this.prisma.chamado.findUnique({ where: { id } });
    if (!chamado) throw new NotFoundException(`Chamado ${id} não encontrado`);
    return this.comSla(chamado);
  }

  /** RF01 — atualizar status, respeitando as transições da RN05. */
  async atualizarStatus(id: number, status: StatusChamado): Promise<ChamadoComSla> {
    const atual = await this.buscar(id);
    if (!transicaoPermitida(atual.status, status)) {
      throw new BadRequestException(`Transição inválida: ${atual.status} → ${status}`);
    }
    const data: Prisma.ChamadoUpdateInput = { status };
    if (status === 'RESOLVIDO') data.resolvidoEm = new Date();
    if (status === 'EM_ATENDIMENTO' && atual.status === 'RESOLVIDO') data.resolvidoEm = null;
    const chamado = await this.prisma.chamado.update({ where: { id }, data });
    return this.comSla(chamado);
  }

  /** RF03 — atribuir técnico, definir prioridade e recalcular o SLA. */
  async atribuir(id: number, dto: AtribuirChamadoDto): Promise<ChamadoComSla> {
    const atual = await this.buscar(id);
    if (atual.status !== 'ABERTO' && atual.status !== 'EM_ATENDIMENTO') {
      throw new BadRequestException('Só chamados abertos ou em atendimento podem ser atribuídos');
    }
    const tecnico = await this.prisma.usuario.findUnique({ where: { id: dto.tecnicoId } });
    if (!tecnico || tecnico.perfil !== Perfil.TECNICO) {
      throw new BadRequestException('O responsável precisa ser um usuário com perfil TECNICO');
    }
    const prioridade = dto.prioridade ?? atual.prioridade;
    const chamado = await this.prisma.chamado.update({
      where: { id },
      data: {
        tecnicoId: dto.tecnicoId,
        prioridade,
        prazoSla: calcularPrazoSla(atual.criadoEm, prioridade),
        status: 'EM_ATENDIMENTO',
      },
    });
    return this.comSla(chamado);
  }
}
