import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prioridade } from '../../generated/prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CriarChamadoDto {
  @ApiProperty({ example: 'Impressora do 2º andar não imprime' })
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  titulo!: string;

  @ApiProperty({ example: 'Desde hoje cedo a impressora mostra erro de papel atolado.' })
  @IsString()
  @MinLength(10)
  descricao!: string;

  @ApiPropertyOptional({ enum: Prioridade, default: Prioridade.MEDIA })
  @IsOptional()
  @IsEnum(Prioridade)
  prioridade?: Prioridade;
}
