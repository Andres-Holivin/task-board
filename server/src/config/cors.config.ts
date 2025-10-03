import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';

/**
 * Configure CORS settings for the application
 */
export function configureCors(app: INestApplication) {
  const configService = app.get(ConfigService<Env, true>);
  const allowedOrigins = configService.get('ALLOWED_ORIGINS', { infer: true });

  console.log('Allowed Origins:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
}
