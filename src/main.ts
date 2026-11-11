import 'dotenv/config';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { criarDocumentoOpenApi } from './swagger';

export function configurarApp(app: import('@nestjs/common').INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configurarApp(app);
  SwaggerModule.setup('docs', app, criarDocumentoOpenApi(app));
  const porta = Number(process.env.PORT ?? 3000);
  await app.listen(porta);
  console.log(`DeskFlow API em http://localhost:${porta} — documentação em /docs`);
}

if (require.main === module) {
  void bootstrap();
}
