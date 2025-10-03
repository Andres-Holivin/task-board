import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/env';
import { ErrorHandler, RequestHandler, ResponseHandler, TimeoutInterceptor } from './config/handler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Env, true>);
  const allowOrigin = configService.get('ALLOWED_ORIGINS', { infer: true });
  console.log('Allowed Origins:', allowOrigin);

  // Enable CORS with additional headers
  app.enableCors({
    origin: allowOrigin,
    credentials: true
  });

  // Register global interceptors and filters
  app.useGlobalInterceptors(
    new RequestHandler(),
    new TimeoutInterceptor(configService), // Add timeout handling
    new ResponseHandler()
  );
  app.useGlobalFilters(new ErrorHandler());

  const port = configService.get('PORT', { infer: true });
  const timeout = configService.get('REQUEST_TIMEOUT', { infer: true });

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`⏱️  Request timeout: ${timeout}ms`);
}
bootstrap();
