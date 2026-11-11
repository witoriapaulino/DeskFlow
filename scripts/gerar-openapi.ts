/**
 * Gera docs/api/openapi.yaml a partir do código (IC-API-01).
 * Uso: npm run openapi  (não precisa de banco)
 */
import 'reflect-metadata';
import { writeFileSync, mkdirSync } from 'fs';
import { dump } from 'js-yaml';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { criarDocumentoOpenApi } from '../src/swagger';

async function gerar(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const doc = criarDocumentoOpenApi(app);
  mkdirSync('docs/api', { recursive: true });
  writeFileSync('docs/api/openapi.yaml', dump(doc, { noRefs: true, lineWidth: 120 }));
  await app.close();
  console.log('docs/api/openapi.yaml gerado');
}

void gerar();
