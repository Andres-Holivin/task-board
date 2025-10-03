import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';
import { IS_PUBLIC_KEY } from '../../shared/decorators/public.decorator';
import { AuthenticatedRequest } from '../../api/auth/interfaces/authenticated-request.interface';
import { firstValueFrom, isObservable } from 'rxjs';

@Injectable()
export class GlobalAuthGuard extends JwtAuthGuard {
    private readonly logger = new Logger(GlobalAuthGuard.name);

    constructor(
        private readonly reflector: Reflector,
        private readonly apiKeyGuard: ApiKeyGuard,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const apiKey = request.headers['x-api-key'];

        this.logger.debug(`Global auth check - API Key: ${apiKey ? 'Present' : 'Missing'}`);

        // If API key is present, use API key authentication
        if (apiKey) {
            this.logger.debug('Using API key authentication');
            try {
                return await this.apiKeyGuard.canActivate(context);
            } catch (error) {
                this.logger.warn(`API key authentication failed: ${error.message}`);
                throw error;
            }
        }

        // Otherwise, use JWT authentication
        this.logger.debug('Using JWT authentication');
        const result = super.canActivate(context);
        if (isObservable(result)) {
            return await firstValueFrom(result);
        }
        return result as boolean;
    }
}