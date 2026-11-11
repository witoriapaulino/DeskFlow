import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RelatoriosService } from './relatorios.service';

@ApiTags('Relatórios')
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'RF05 — Painel de atendimento (status, técnicos e SLA)' })
  resumo() {
    return this.service.resumo();
  }
}
