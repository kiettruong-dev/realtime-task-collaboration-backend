import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const logger = new Logger('Bootstrap');

  // Use global validation pipe for request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Enable CORS for all origins
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Error during application bootstrap', err);
  process.exit(1);
});
