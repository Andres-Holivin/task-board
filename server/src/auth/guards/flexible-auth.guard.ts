import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';
import { firstValueFrom, isObservable } from 'rxjs';
import { AuthenticatedRequest } from '../../api/auth/interfaces/authenticated-request.interface';

@Injectable()
export class FlexibleAuthGuard implements CanActivate {
    private readonly logger = new Logger(FlexibleAuthGuard.name);

    constructor(
        private readonly jwtAuthGuard: JwtAuthGuard,
        private readonly apiKeyGuard: ApiKeyGuard,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        // Check if API key is present
        const apiKey = request.headers['x-api-key'];

        this.logger.debug(`Authentication attempt - API Key: ${apiKey ? 'Present' : 'Missing'}`);

        if (apiKey) {
            this.logger.debug('Attempting API key authentication');
            // Try API key authentication - let errors propagate
            return await this.apiKeyGuard.canActivate(context);
        }

        // Try JWT authentication
        this.logger.debug('Attempting JWT authentication');
        try {
            const result = this.jwtAuthGuard.canActivate(context);
            if (isObservable(result)) {
                return await firstValueFrom(result);
            }
            return result;
        } catch (error) {
            this.logger.warn(`JWT authentication failed: ${error.message}`);
            throw new UnauthorizedException(
                'Authentication required: Provide either a valid JWT token or API key',
            );
        }
    }
}
