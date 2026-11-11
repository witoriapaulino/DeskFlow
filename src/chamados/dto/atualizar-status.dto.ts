import { ApiProperty } from '@nestjs/swagger';
import { StatusChamado } from '../../generated/prisma/client';
import { IsEnum } from 'class-validator';

export class AtualizarStatusDto {
  @ApiProperty({ enum: StatusChamado, example: StatusChamado.FECHADO })
  @IsEnum(StatusChamado)
  status!: StatusChamado;
}
