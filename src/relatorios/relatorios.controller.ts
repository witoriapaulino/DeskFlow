import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Perfis } from '../auth/decorators';
import { RelatoriosService } from './relatorios.service';

@ApiTags('Relatórios')
@ApiBearerAuth()
@Perfis('GESTOR')
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'RF05 — Painel de atendimento (status, técnicos e SLA) — só GESTOR' })
  resumo() {
    return this.service.resumo();
  }
}
