import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';
import { HttpExceptionFilter } from '../core/filters/http-exception.filter';
import { RequestSanitizerInterceptor } from '../core/interceptors/request-sanitizer.interceptor';
import { ResponseTransformInterceptor } from '../core/interceptors/response-transform.interceptor';
import { TimeoutInterceptor } from '../core/interceptors/timeout.interceptor';

/**
 * Register all global interceptors and filters
 */
export function configureGlobalProviders(app: INestApplication) {
  const configService = app.get(ConfigService<Env, true>);

  // Register global interceptors in order of execution
  app.useGlobalInterceptors(
    new RequestSanitizerInterceptor(),
    new TimeoutInterceptor(configService),
    new ResponseTransformInterceptor()
  );

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
}
