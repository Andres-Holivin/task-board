import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/env';
import { configureCors } from './config/cors.config';
import { configureGlobalProviders } from './config/app.config';
import { swaggerConfig } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService<Env, true>);

  // Configure CORS
  configureCors(app);

  // Register global interceptors and filters
  configureGlobalProviders(app);

  // Configure Swagger (only in non-production environments)
  swaggerConfig(app);

  const port = configService.get('PORT', { infer: true });
  const timeout = configService.get('REQUEST_TIMEOUT', { infer: true });
  const nodeEnv = configService.get('NODE_ENV', { infer: true });



  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`⏱️  Request timeout: ${timeout}ms`);
  console.log(`🌍 Environment: ${nodeEnv}`);
}
bootstrap();
