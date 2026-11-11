import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CHAVE_PUBLICO, UsuarioAutenticado } from './decorators';

/** RF02 — toda rota exige token JWT válido, exceto as marcadas com @Publico(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const publico = this.reflector.getAllAndOverride<boolean>(CHAVE_PUBLICO, [ctx.getHandler(), ctx.getClass()]);
    if (publico) return true;

    const req = ctx.switchToHttp().getRequest();
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException('Faça login para acessar');
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number; email: string; perfil: UsuarioAutenticado['perfil'] }>(token);
      req.usuario = { id: payload.sub, email: payload.email, perfil: payload.perfil } satisfies UsuarioAutenticado;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
