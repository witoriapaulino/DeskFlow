import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegistrarSolucaoDto {
  @ApiProperty({ example: 'Removido o papel atolado e limpo o rolo de tração.' })
  @IsString()
  @MinLength(10)
  descricao!: string;

  @ApiProperty({ example: 2, description: 'Técnico que resolveu (precisa ser o técnico atribuído)' })
  @IsInt()
  tecnicoId!: number;

  @ApiPropertyOptional({ default: false, description: 'Publicar a solução na base de conhecimento' })
  @IsOptional()
  @IsBoolean()
  publicarNaBase?: boolean;

  @ApiPropertyOptional({ example: 'Como resolver papel atolado na impressora' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  tituloArtigo?: string;
}
