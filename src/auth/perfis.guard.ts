import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Perfil } from '../generated/prisma/client';
import { CHAVE_PERFIS, UsuarioAutenticado } from './decorators';

/** RF02 — confere se o perfil do usuário pode usar a rota. */
@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const perfis = this.reflector.getAllAndOverride<Perfil[]>(CHAVE_PERFIS, [ctx.getHandler(), ctx.getClass()]);
    if (!perfis || perfis.length === 0) return true;
    const usuario: UsuarioAutenticado | undefined = ctx.switchToHttp().getRequest().usuario;
    if (!usuario || !perfis.includes(usuario.perfil)) {
      throw new ForbiddenException('Seu perfil não tem acesso a esta operação');
    }
    return true;
  }
}
