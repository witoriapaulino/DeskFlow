import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ChamadosModule } from './chamados/chamados.module';

@Module({
  imports: [PrismaModule, ChamadosModule],
})
export class AppModule {}
