import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Perfil } from '../generated/prisma/client';

export const CHAVE_PUBLICO = 'deskflow:publico';
export const CHAVE_PERFIS = 'deskflow:perfis';

/** Libera a rota sem login (ex.: /auth/login). */
export const Publico = () => SetMetadata(CHAVE_PUBLICO, true);

/** Restringe a rota aos perfis informados (RF02). */
export const Perfis = (...perfis: Perfil[]) => SetMetadata(CHAVE_PERFIS, perfis);

export interface UsuarioAutenticado {
  id: number;
  email: string;
  perfil: Perfil;
}

/** Injeta no método o usuário que veio no token JWT. */
export const UsuarioAtual = createParamDecorator(
  (_dado: unknown, ctx: ExecutionContext): UsuarioAutenticado => ctx.switchToHttp().getRequest().usuario,
);
