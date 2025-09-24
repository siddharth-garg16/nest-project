import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // global level validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties that don't have decorators
      forbidNonWhitelisted: true, // throws error if any non-whitelist properties are present (to be used with caution)
      transform: true, // automatically transforms payloads to be objects typed according to their dto classes
      disableErrorMessages: false, // give detailed error messages (not good for prod)
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
