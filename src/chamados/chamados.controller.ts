import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Perfis, UsuarioAtual, UsuarioAutenticado } from '../auth/decorators';
import { ChamadosService } from './chamados.service';
import { AtribuirChamadoDto } from './dto/atribuir-chamado.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { FiltroChamadosDto } from './dto/filtro-chamados.dto';

@ApiTags('Chamados')
@ApiBearerAuth()
@Controller('chamados')
export class ChamadosController {
  constructor(private readonly service: ChamadosService) {}

  @Post()
  @ApiOperation({ summary: 'RF01 — Abrir chamado' })
  criar(@Body() dto: CriarChamadoDto, @UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.service.criar(dto, usuario.id);
  }

  @Get()
  @ApiOperation({ summary: 'RF01 — Listar chamados (filtros: status, técnico, SLA vencido)' })
  listar(@Query() filtro: FiltroChamadosDto, @UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.service.listar(filtro, usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'RF01 — Consultar chamado' })
  buscar(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.service.buscar(id, usuario);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'RF01 — Atualizar status do chamado' })
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarStatusDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.service.atualizarStatus(id, dto.status, usuario);
  }

  @Patch(':id/atribuicao')
  @Perfis('GESTOR', 'TECNICO')
  @ApiOperation({ summary: 'RF03 — Atribuir técnico, prioridade e SLA (gestor ou técnico)' })
  atribuir(@Param('id', ParseIntPipe) id: number, @Body() dto: AtribuirChamadoDto) {
    return this.service.atribuir(id, dto);
  }
}
