import {
    CallHandler,
    ExecutionContext,
    GatewayTimeoutException,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Env } from '../../config/env';

/**
 * Interceptor to handle request timeouts
 * Throws GatewayTimeoutException if request exceeds configured timeout
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    private readonly requestTimeout: number;
    private readonly logger = new Logger(TimeoutInterceptor.name);

    constructor(private readonly configService: ConfigService<Env, true>) {
        this.requestTimeout = this.configService.get<number>('REQUEST_TIMEOUT', { infer: true });
        this.logger.log(`Request timeout set to ${this.requestTimeout}ms`);
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();

        this.logger.debug(`[${request.method}] ${request.url} - Request started`);

        return next.handle().pipe(
            timeout({
                each: this.requestTimeout,
                with: () => {
                    const elapsed = Date.now() - startTime;
                    this.logger.warn(
                        `Request timeout after ${elapsed}ms: [${request.method}] ${request.url}`
                    );
                    return throwError(() => new GatewayTimeoutException(
                        `Request timeout after ${this.requestTimeout}ms`
                    ));
                }
            }),
            catchError((error) => {
                if (error instanceof TimeoutError) {
                    const elapsed = Date.now() - startTime;
                    this.logger.error(
                        `Request timeout: [${request.method}] ${request.url} (${elapsed}ms)`
                    );
                    return throwError(() => new GatewayTimeoutException(
                        `Request processing exceeded ${this.requestTimeout}ms timeout`
                    ));
                }
                return throwError(() => error);
            }),
        );
    }
}
