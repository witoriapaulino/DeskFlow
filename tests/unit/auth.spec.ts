import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcryptjs';
import { AuthService } from '../../src/auth/auth.service';
import { PerfisGuard } from '../../src/auth/perfis.guard';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('RF02 — AuthService', () => {
  const jwt = new JwtService({ secret: 'segredo-de-teste' });
  const usuario = { id: 1, nome: 'Ana', email: 'ana@x.com', senhaHash: hashSync('Senha@123', 4), perfil: 'USUARIO', criadoEm: new Date() };
  let prisma: { usuario: { findUnique: jest.Mock; create: jest.Mock } };
  let service: AuthService;

  beforeEach(() => {
    prisma = { usuario: { findUnique: jest.fn(), create: jest.fn() } };
    service = new AuthService(prisma as unknown as PrismaService, jwt);
  });

  it('login correto devolve token com o perfil e não expõe a senha', async () => {
    prisma.usuario.findUnique.mockResolvedValue(usuario);
    const r = await service.login({ email: 'ANA@x.com', senha: 'Senha@123' });
    const payload = await jwt.verifyAsync(r.accessToken);
    expect(payload).toMatchObject({ sub: 1, perfil: 'USUARIO' });
    expect(r.usuario).not.toHaveProperty('senhaHash');
  });

  it('senha errada é recusada', async () => {
    prisma.usuario.findUnique.mockResolvedValue(usuario);
    await expect(service.login({ email: 'ana@x.com', senha: 'errada1' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('autocadastro recusa e-mail repetido', async () => {
    prisma.usuario.findUnique.mockResolvedValue(usuario);
    await expect(service.registrar({ nome: 'Ana', email: 'ana@x.com', senha: 'Senha@123' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('autocadastro sempre cria perfil USUARIO com senha criptografada', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.usuario.create.mockImplementation(async ({ data }) => ({ id: 5, criadoEm: new Date(), ...data }));
    await service.registrar({ nome: 'Bia', email: 'bia@x.com', senha: 'Senha@123' });
    const data = prisma.usuario.create.mock.calls[0][0].data;
    expect(data.perfil).toBe('USUARIO');
    expect(data.senhaHash).not.toBe('Senha@123');
  });
});

describe('RF02 — PerfisGuard', () => {
  function contexto(perfil: string) {
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ usuario: { id: 1, email: 'x', perfil } }) }),
    } as never;
  }
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector & { getAllAndOverride: jest.Mock };

  it('libera rota sem restrição de perfil', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(new PerfisGuard(reflector).canActivate(contexto('USUARIO'))).toBe(true);
  });
  it('libera perfil autorizado', () => {
    reflector.getAllAndOverride.mockReturnValue(['GESTOR']);
    expect(new PerfisGuard(reflector).canActivate(contexto('GESTOR'))).toBe(true);
  });
  it('bloqueia perfil não autorizado com 403', () => {
    reflector.getAllAndOverride.mockReturnValue(['GESTOR']);
    expect(() => new PerfisGuard(reflector).canActivate(contexto('USUARIO'))).toThrow(ForbiddenException);
  });
});
