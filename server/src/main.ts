import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Env } from './config/env';
import { configureCors } from './config/cors.config';
import { configureGlobalProviders } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService<Env, true>);

  // Configure CORS
  configureCors(app);

  // Register global interceptors and filters
  configureGlobalProviders(app);

  const port = configService.get('PORT', { infer: true });
  const timeout = configService.get('REQUEST_TIMEOUT', { infer: true });
  const nodeEnv = configService.get('NODE_ENV', { infer: true });

  // Configure Swagger (only in non-production environments)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Task Board API')
      .setDescription('The Task Board API documentation')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('tasks', 'Task management endpoints')
      .addTag('api-keys', 'API key management endpoints')
      .addTag('emails', 'Email notification endpoints')
      .addTag('health', 'Health check endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'Task Board API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    console.log(`📚 Swagger documentation available at http://localhost:${port}/api`);
  }

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`⏱️  Request timeout: ${timeout}ms`);
  console.log(`🌍 Environment: ${nodeEnv}`);
}
bootstrap();
