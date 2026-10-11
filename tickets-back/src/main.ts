import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

import { AppModule } from './app.module';
import { validationExceptionFactory } from './i18n';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  app.set('trust proxy', 'loopback');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.useBodyParser('json', { limit: '100kb' });

  app.setGlobalPrefix('api');

  // Despliegue de un solo servicio: la API sirve también la web compilada (WEB_DIR)
  const webDir = process.env.WEB_DIR && resolve(process.env.WEB_DIR);
  if (webDir && existsSync(join(webDir, 'index.html'))) {
    app.useStaticAssets(join(webDir, 'assets'), {
      prefix: '/assets',
      immutable: true,
      maxAge: '1y',
    });
    app.useStaticAssets(webDir, { index: 'index.html', maxAge: 0 });
    logger.log(`Web servida desde ${webDir}`);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: { target: true, value: false },
      exceptionFactory: validationExceptionFactory,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Resolvo API')
    .setDescription('API de Resolvo, mesa de ayuda de TI de código abierto')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .setVersion('1.0')
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  app.enableCors();

  await app.listen(process.env.PORT || 3010);
  logger.log(`Servidor ejecutándose en ${await app.getUrl()}`);
}
bootstrap();
