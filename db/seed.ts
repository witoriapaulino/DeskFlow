/**
 * Usuários de demonstração (dados fictícios). Senha de todos: Senha@123
 * Uso: npm run db:seed
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashSync } from 'bcryptjs';
import { Perfil, PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main(): Promise<void> {
  const senhaHash = hashSync('Senha@123', 10);
  const usuarios: { nome: string; email: string; perfil: Perfil }[] = [
    { nome: 'Usuária Demo', email: 'usuario@deskflow.dev', perfil: 'USUARIO' },
    { nome: 'Técnico Demo', email: 'tecnico@deskflow.dev', perfil: 'TECNICO' },
    { nome: 'Gestora Demo', email: 'gestor@deskflow.dev', perfil: 'GESTOR' },
  ];
  for (const u of usuarios) {
    await prisma.usuario.upsert({ where: { email: u.email }, update: {}, create: { ...u, senhaHash } });
  }
  console.log('Seed concluído: 3 usuários de demonstração');
}

main().finally(() => prisma.$disconnect());
