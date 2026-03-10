import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { Request, Response } from 'express'; // ✅ add this

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

  app.enableCors({
    origin: true,
    credentials: true,
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