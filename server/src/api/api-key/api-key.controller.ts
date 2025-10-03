import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeyService } from './api-key.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { createApiKeySchema, type CreateApiKeyDTO } from './dto/api-key.dto';
import { type User } from '../auth/interfaces/auth.interface';

@ApiTags('api-keys')
@ApiBearerAuth('JWT-auth')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
    constructor(private readonly apiKeyService: ApiKeyService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new API key' })
    @ApiResponse({ status: 201, description: 'API key created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    async createApiKey(
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(createApiKeySchema)) createApiKeyDto: CreateApiKeyDTO,
    ) {
        return this.apiKeyService.createApiKey(user.id, createApiKeyDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all API keys for the authenticated user' })
    @ApiResponse({ status: 200, description: 'API keys retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    async listApiKeys(@CurrentUser() user: User) {
        return this.apiKeyService.listApiKeys(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific API key by ID' })
    @ApiResponse({ status: 200, description: 'API key retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 404, description: 'API key not found' })
    async getApiKey(@CurrentUser() user: User, @Param('id') id: string) {
        return this.apiKeyService.getApiKey(user.id, id);
    }

    @Delete(':id/revoke')
    @ApiOperation({ summary: 'Revoke an API key' })
    @ApiResponse({ status: 200, description: 'API key revoked successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 404, description: 'API key not found' })
    async revokeApiKey(@CurrentUser() user: User, @Param('id') id: string) {
        await this.apiKeyService.revokeApiKey(user.id, id);
        return { message: 'API key revoked successfully' };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an API key' })
    @ApiResponse({ status: 200, description: 'API key deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 404, description: 'API key not found' })
    async deleteApiKey(@CurrentUser() user: User, @Param('id') id: string) {
        await this.apiKeyService.deleteApiKey(user.id, id);
        return { message: 'API key deleted successfully' };
    }
}
