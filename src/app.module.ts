import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChamadosModule } from './chamados/chamados.module';
import { ConhecimentoModule } from './conhecimento/conhecimento.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [PrismaModule, AuthModule, ChamadosModule, ConhecimentoModule, RelatoriosModule],
})
export class AppModule {}
