import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Configuração do Prisma 7: schema e migrações na pasta db/ (passo 10 do PDF)
export default defineConfig({
  schema: 'db/schema.prisma',
  migrations: { path: 'db/migrations', seed: 'ts-node db/seed.ts' },
  // sem .env o `prisma generate` ainda funciona (usado no npm install)
  datasource: { url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/deskflow' },
});
