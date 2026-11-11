import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChamadosService } from './chamados.service';
import { AtribuirChamadoDto } from './dto/atribuir-chamado.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { FiltroChamadosDto } from './dto/filtro-chamados.dto';

@ApiTags('Chamados')
@Controller('chamados')
export class ChamadosController {
  constructor(private readonly service: ChamadosService) {}

  @Post()
  @ApiOperation({ summary: 'RF01 — Abrir chamado' })
  criar(@Body() dto: CriarChamadoDto) {
    return this.service.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'RF01 — Listar chamados (filtros: status, técnico, SLA vencido)' })
  listar(@Query() filtro: FiltroChamadosDto) {
    return this.service.listar(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'RF01 — Consultar chamado' })
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'RF01 — Atualizar status do chamado' })
  atualizarStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarStatusDto) {
    return this.service.atualizarStatus(id, dto.status);
  }

  @Patch(':id/atribuicao')
  @ApiOperation({ summary: 'RF03 — Atribuir técnico, prioridade e SLA' })
  atribuir(@Param('id', ParseIntPipe) id: number, @Body() dto: AtribuirChamadoDto) {
    return this.service.atribuir(id, dto);
  }
}
