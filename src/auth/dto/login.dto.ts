import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@deskflow.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  @MinLength(6)
  senha!: string;
}
