import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prioridade } from '../../generated/prisma/client';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class AtribuirChamadoDto {
  @ApiProperty({ example: 2, description: 'Técnico responsável' })
  @IsInt()
  tecnicoId!: number;

  @ApiPropertyOptional({ enum: Prioridade, description: 'Se informada, recalcula o prazo de SLA' })
  @IsOptional()
  @IsEnum(Prioridade)
  prioridade?: Prioridade;
}
