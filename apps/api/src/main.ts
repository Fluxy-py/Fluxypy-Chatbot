import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Root route
  app.getHttpAdapter().get('/', (req: Request, res: Response) => {
    res.send('🚀 Your API is running');
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  // Widget endpoints must accept any origin (domain check is done in WidgetSecurityService)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow widget endpoints from any origin
      // Domain authorization is handled in the WidgetSecurityService
      callback(null, true);
    },
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-api-key',
      'x-session-token',
    ],
  });

  app.useStaticAssets(
    join(__dirname, '..', '..', '..', 'widget'),
    { prefix: '/widget' },
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🤖 Fluxypy Bot API is running!`);
  console.log(`📡 http://localhost:${port}/api/v1`);
  console.log(`🌐 http://localhost:${port}/`);
  console.log(`🧩 http://localhost:${port}/widget/test.html`);
}

bootstrap();