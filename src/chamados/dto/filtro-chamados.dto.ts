import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusChamado } from '../../generated/prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';

export class FiltroChamadosDto {
  @ApiPropertyOptional({ enum: StatusChamado })
  @IsOptional()
  @IsEnum(StatusChamado)
  status?: StatusChamado;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tecnicoId?: number;

  @ApiPropertyOptional({ description: 'true = só chamados com SLA vencido' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  slaVencido?: boolean;
}
