import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor to transform all responses into a consistent format
 * Wraps responses with success flag, status code, and message
 * Handles StreamableFile separately without wrapping
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                // Don't wrap StreamableFile responses
                if (data instanceof StreamableFile) {
                    return data;
                }

                const response = context.switchToHttp().getResponse();

                return {
                    success: true,
                    statusCode: response.statusCode,
                    message: 'Success',
                    data: data,
                };
            }),
        );
    }
}
