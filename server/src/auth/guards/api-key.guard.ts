import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AuthenticatedRequest } from '../../api/auth/interfaces/authenticated-request.interface';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    private readonly logger = new Logger(ApiKeyGuard.name);

    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const apiKey = this.extractApiKeyFromHeader(request);

        this.logger.debug(`API Key extracted: ${apiKey ? 'Present' : 'Missing'}`);

        if (!apiKey) {
            throw new UnauthorizedException('API key is missing');
        }

        const validApiKey = await this.validateApiKey(apiKey);

        if (!validApiKey) {
            this.logger.warn(`Invalid or expired API key attempted: ${apiKey.substring(0, 15)}...`);
            throw new UnauthorizedException('Invalid or expired API key');
        }

        this.logger.debug(`API Key validated for user: ${validApiKey.userId}`);

        // Attach user information to request
        request.user = {
            userId: validApiKey.userId,
            authMethod: 'api-key',
        };

        return true;
    }

    private extractApiKeyFromHeader(request: AuthenticatedRequest): string | null {
        const apiKey = request.headers['x-api-key'];
        if (typeof apiKey === 'string') {
            return apiKey;
        }
        return null;
    }

    private async validateApiKey(key: string) {
        try {
            const apiKey = await this.prisma.apiKey.findUnique({
                where: { key },
            });

            this.logger.debug(`API Key lookup result: ${apiKey ? 'Found' : 'Not found'}`);

            if (!apiKey?.isActive) {
                this.logger.debug(`API Key is ${!apiKey ? 'not found' : 'inactive'}`);
                return null;
            }

            // Check if expired
            if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
                this.logger.debug(`API Key expired at: ${apiKey.expiresAt}`);
                return null;
            }

            return apiKey;
        } catch (error) {
            this.logger.error(`Error validating API key: ${error.message}`);
            return null;
        }
    }
}
