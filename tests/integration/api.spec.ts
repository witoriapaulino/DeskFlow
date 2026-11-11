/**
 * Testes de integração: API NestJS completa + PostgreSQL real (Supertest).
 * Precisa de DATABASE_URL apontando para um banco com as migrações aplicadas.
 * ATENÇÃO: os registros desse banco são removidos no início. Use um banco só de teste.
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hashSync } from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configurarApp } from '../../src/main';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('API DeskFlow (integração)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};
  const ids: Record<string, number> = {};

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    configurarApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    // banco de teste limpo (ordem respeita as chaves estrangeiras)
    await prisma.artigoConhecimento.deleteMany();
    await prisma.solucao.deleteMany();
    await prisma.chamado.deleteMany();
    await prisma.usuario.deleteMany();

    const senhaHash = hashSync('Senha@123', 4);
    const contas = [
      ['USUARIO', 'u@t.dev'],
      ['TECNICO', 't@t.dev'],
      ['GESTOR', 'g@t.dev'],
      ['USUARIO', 'outro@t.dev'],
    ] as const;
    for (const [perfil, email] of contas) {
      const u = await prisma.usuario.create({ data: { nome: email, email, senhaHash, perfil } });
      const r = await request(app.getHttpServer()).post('/auth/login').send({ email, senha: 'Senha@123' }).expect(200);
      tokens[email] = r.body.accessToken;
      ids[email] = u.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  const auth = (email: string) => ({ Authorization: `Bearer ${tokens[email]}` });

  it('RF02: sem token responde 401', async () => {
    await request(app.getHttpServer()).get('/chamados').expect(401);
  });

  it('RF02: autocadastro cria USUARIO e não devolve a senha', async () => {
    const r = await request(app.getHttpServer())
      .post('/auth/registrar')
      .send({ nome: 'Nova Pessoa', email: 'nova@t.dev', senha: 'Senha1234' })
      .expect(201);
    expect(r.body.perfil).toBe('USUARIO');
    expect(r.body.senhaHash).toBeUndefined();
  });

  it('fluxo completo: abrir → atribuir → resolver → fechar → relatório', async () => {
    const srv = app.getHttpServer();
    const aberto = await request(srv)
      .post('/chamados')
      .set(auth('u@t.dev'))
      .send({ titulo: 'VPN não conecta', descricao: 'Erro de autenticação na VPN', prioridade: 'ALTA' })
      .expect(201);
    expect(aberto.body.solicitanteId).toBe(ids['u@t.dev']);
    const id = aberto.body.id;

    await request(srv).get(`/chamados/${id}`).set(auth('outro@t.dev')).expect(403);

    const atribuido = await request(srv)
      .patch(`/chamados/${id}/atribuicao`)
      .set(auth('g@t.dev'))
      .send({ tecnicoId: ids['t@t.dev'] })
      .expect(200);
    expect(atribuido.body.status).toBe('EM_ATENDIMENTO');

    await request(srv)
      .patch(`/chamados/${id}/atribuicao`)
      .set(auth('u@t.dev'))
      .send({ tecnicoId: ids['t@t.dev'] })
      .expect(403);

    const resolvido = await request(srv)
      .post(`/chamados/${id}/solucao`)
      .set(auth('t@t.dev'))
      .send({ descricao: 'Certificado da VPN renovado no notebook.', publicarNaBase: true })
      .expect(201);
    expect(resolvido.body.artigo.chamadoOrigemId).toBe(id);

    const base = await request(srv).get('/base-conhecimento?busca=vpn').set(auth('u@t.dev')).expect(200);
    expect(base.body.length).toBe(1);

    await request(srv).patch(`/chamados/${id}/status`).set(auth('u@t.dev')).send({ status: 'FECHADO' }).expect(200);

    await request(srv).get('/relatorios/resumo').set(auth('u@t.dev')).expect(403);
    const resumo = await request(srv).get('/relatorios/resumo').set(auth('g@t.dev')).expect(200);
    expect(resumo.body.porStatus.FECHADO).toBe(1);
    expect(resumo.body.sla.percentualNoPrazo).toBe(100);
  });

  it('validação: corpo inválido responde 400', async () => {
    await request(app.getHttpServer()).post('/chamados').set(auth('u@t.dev')).send({ titulo: 'x' }).expect(400);
  });
});
