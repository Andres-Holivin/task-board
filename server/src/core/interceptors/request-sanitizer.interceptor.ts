import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Interceptor to sanitize incoming request data
 * Trims whitespace from all string values in query, body, and params
 */
@Injectable()
export class RequestSanitizerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        const inputs = [request.query, request.body, request.params];

        for (const input of inputs) {
            if (!input) continue;

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
