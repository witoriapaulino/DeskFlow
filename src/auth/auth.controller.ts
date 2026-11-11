import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Publico, UsuarioAtual, UsuarioAutenticado } from './decorators';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Publico()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'RF02 — Login (retorna token JWT)' })
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Publico()
  @Post('registrar')
  @ApiOperation({ summary: 'RF02 — Autocadastro de usuário (perfil USUARIO)' })
  registrar(@Body() dto: RegistrarDto) {
    return this.service.registrar(dto);
  }

  @Get('perfil')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'RF02 — Dados do usuário logado' })
  perfil(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.service.perfil(usuario.id);
  }
}
