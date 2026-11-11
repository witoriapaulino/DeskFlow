import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

/** Gera o contrato OpenAPI (IC-API-01) a partir dos controllers. */
export function criarDocumentoOpenApi(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('DeskFlow API')
    .setDescription('Central de Serviços de TI — Projeto Integrador de Gerência de Configuração (Fametro)')
    .setVersion(process.env.npm_package_version ?? '0.0.0')
    .build();
  return SwaggerModule.createDocument(app, config);
}
