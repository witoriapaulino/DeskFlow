import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Perfis, UsuarioAtual, UsuarioAutenticado } from '../auth/decorators';
import { ConhecimentoService } from './conhecimento.service';
import { RegistrarSolucaoDto } from './dto/registrar-solucao.dto';

@ApiTags('Solução e Base de Conhecimento')
@ApiBearerAuth()
@Controller()
export class ConhecimentoController {
  constructor(private readonly service: ConhecimentoService) {}

  @Post('chamados/:id/solucao')
  @Perfis('TECNICO')
  @ApiOperation({ summary: 'RF04 — Registrar solução e resolver o chamado (técnico atribuído)' })
  registrarSolucao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarSolucaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.service.registrarSolucao(id, dto, usuario.id);
  }

  @Get('base-conhecimento')
  @ApiOperation({ summary: 'RF04 — Buscar artigos da base de conhecimento' })
  @ApiQuery({ name: 'busca', required: false })
  buscarArtigos(@Query('busca') busca?: string) {
    return this.service.buscarArtigos(busca);
  }

  @Get('base-conhecimento/:id')
  @ApiOperation({ summary: 'RF04 — Consultar artigo' })
  buscarArtigo(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscarArtigo(id);
  }
}
