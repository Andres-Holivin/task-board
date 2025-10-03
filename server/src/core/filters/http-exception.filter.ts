import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global exception filter to handle all HTTP exceptions
 * Provides consistent error response format across the application
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const { statusCode, message } = this.mapException(exception);

        this.logger.error('Error occurred', { statusCode, message, exception });

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

        if (typeof res === 'string') {
            return res;
        }

        if (typeof res === 'object' && res !== null) {
            const maybeMsg = (res as any).message ?? (res as any).error;
            if (Array.isArray(maybeMsg)) {
                return maybeMsg.join(', ');
            }
            if (maybeMsg) {
                return String(maybeMsg);
            }
            return JSON.stringify(res);
        }

        return exception.message;
    }
}
