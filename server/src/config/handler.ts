import {
    ArgumentsHost,
    CallHandler,
    Catch,
    ExceptionFilter,
    ExecutionContext,
    GatewayTimeoutException,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NestInterceptor,
    StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
    Observable,
    TimeoutError,
    catchError,
    map,
    throwError,
    timeout,
} from 'rxjs';
import { Env } from './env';

@Catch()
export class ErrorHandler implements ExceptionFilter {
    private readonly logger = new Logger(ErrorHandler.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const { statusCode, message } = this.mapException(exception);

        this.logger.error("Error occurred", { statusCode, message, exception });

        response.status(statusCode).json({
            success: false,
            statusCode,
            message,
        });
    }

    private mapException(exception: any): { statusCode: number; message: string } {
        if (exception instanceof HttpException) {
            return {
                statusCode: exception.getStatus(),
                message: this.extractMessage(exception),
            };
        }

        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: exception?.message || 'Internal Server Error',
        };
    }

    private extractMessage(exception: HttpException): string {
        const res = exception.getResponse();
        if (typeof res === 'string') return res;
        if (typeof res === 'object' && res !== null) {
            const maybeMsg = (res as any).message ?? (res as any).error;
            if (Array.isArray(maybeMsg)) return maybeMsg.join(', ');
            if (maybeMsg) return String(maybeMsg);
            return JSON.stringify(res);
        }
        return exception.message;
    }
}

@Injectable()
export class ResponseHandler implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                console.log('Response data:', data);
                // logic for handling response json or stream file
                if (data instanceof StreamableFile) {
                    return data;
                } else {
                    return {
                        success: true,
                        statusCode: context.switchToHttp().getResponse().statusCode,
                        message: 'Success',
                        data: data,
                    };
                }
            }),
        );
    }
}
@Injectable()
export class RequestHandler implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        const inputs = [request.query, request.body, request.params];

        for (const input of inputs) {
            for (const key in input) {
                const value = input[key];
                if (typeof value === 'string' || value instanceof String) {
                    input[key] = value.trim();
                }
            }
        }
        return next.handle();
    }
}
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

        // Log request details
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
            map((data) => {
                const elapsed = Date.now() - startTime;
                this.logger.debug(
                    `[${request.method}] ${request.url} - Completed in ${elapsed}ms`
                );
                return data;
            })
        );
    }
}
