import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ArtigoConhecimento, Solucao } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarSolucaoDto } from './dto/registrar-solucao.dto';

@Injectable()
export class ConhecimentoService {
  constructor(private readonly prisma: PrismaService) {}

  /** RF04 — registrar a solução, resolver o chamado e, se pedido, publicar na base. */
  async registrarSolucao(
    chamadoId: number,
    dto: RegistrarSolucaoDto,
    tecnicoId: number,
  ): Promise<{ solucao: Solucao; artigo: ArtigoConhecimento | null }> {
    const chamado = await this.prisma.chamado.findUnique({ where: { id: chamadoId } });
    if (!chamado) throw new NotFoundException(`Chamado ${chamadoId} não encontrado`);
    if (chamado.status !== 'EM_ATENDIMENTO') {
      throw new BadRequestException('Só é possível registrar solução de chamado em atendimento');
    }
    if (chamado.tecnicoId !== tecnicoId) {
      throw new BadRequestException('A solução precisa ser registrada pelo técnico atribuído');
    }

    return this.prisma.$transaction(async (tx) => {
      const solucao = await tx.solucao.upsert({
        where: { chamadoId },
        update: { descricao: dto.descricao, tecnicoId },
        create: { chamadoId, descricao: dto.descricao, tecnicoId },
      });
      await tx.chamado.update({
        where: { id: chamadoId },
        data: { status: 'RESOLVIDO', resolvidoEm: new Date() },
      });
      const artigo = dto.publicarNaBase
        ? await tx.artigoConhecimento.create({
            data: {
              titulo: dto.tituloArtigo ?? chamado.titulo,
              conteudo: `Problema: ${chamado.descricao}\n\nSolução: ${dto.descricao}`,
              chamadoOrigemId: chamadoId,
            },
          })
        : null;
      return { solucao, artigo };
    });
  }

  /** RF04 — buscar artigos da base de conhecimento. */
  async buscarArtigos(busca?: string): Promise<ArtigoConhecimento[]> {
    const termo = busca?.trim();
    return this.prisma.artigoConhecimento.findMany({
      where: termo
        ? {
            OR: [
              { titulo: { contains: termo, mode: 'insensitive' } },
              { conteudo: { contains: termo, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscarArtigo(id: number): Promise<ArtigoConhecimento> {
    const artigo = await this.prisma.artigoConhecimento.findUnique({ where: { id } });
    if (!artigo) throw new NotFoundException(`Artigo ${id} não encontrado`);
    return artigo;
  }
}
