import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { Usuario } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';

export type UsuarioPublico = Omit<Usuario, 'senhaHash'>;

export function semSenha(u: Usuario): UsuarioPublico {
  const { senhaHash: _omitido, ...resto } = u;
  return resto;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  /** RF02 — login: devolve o token JWT e os dados do usuário. */
  async login(dto: LoginDto): Promise<{ accessToken: string; usuario: UsuarioPublico }> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!usuario || !(await compare(dto.senha, usuario.senhaHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    const accessToken = await this.jwt.signAsync({ sub: usuario.id, email: usuario.email, perfil: usuario.perfil });
    return { accessToken, usuario: semSenha(usuario) };
  }

  /** RF02 — autocadastro: sempre cria perfil USUARIO (técnicos e gestores são criados pelo gestor). */
  async registrar(dto: RegistrarDto): Promise<UsuarioPublico> {
    const email = dto.email.toLowerCase();
    const existente = await this.prisma.usuario.findUnique({ where: { email } });
    if (existente) throw new ConflictException('E-mail já cadastrado');
    const usuario = await this.prisma.usuario.create({
      data: { nome: dto.nome, email, senhaHash: await hash(dto.senha, 10), perfil: 'USUARIO' },
    });
    return semSenha(usuario);
  }

  async perfil(id: number): Promise<UsuarioPublico> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new UnauthorizedException();
    return semSenha(usuario);
  }
}
