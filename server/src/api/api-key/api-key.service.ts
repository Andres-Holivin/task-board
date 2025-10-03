import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../config/prisma.service';
import { ApiKeyListItem, ApiKeyResponse, CreateApiKeyDTO } from './dto/api-key.dto';

@Injectable()
export class ApiKeyService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate a secure random API key
     */
    private generateApiKey(): string {
        // Format: ak_[32 random hex characters]
        return `ak_${randomBytes(32).toString('hex')}`;
    }

    /**
     * Create a new API key for a user
     */
    async createApiKey(userId: string, createApiKeyDto: CreateApiKeyDTO): Promise<ApiKeyResponse> {
        const key = this.generateApiKey();

        const apiKey = await this.prisma.apiKey.create({
            data: {
                key,
                name: createApiKeyDto.name,
                userId,
                expiresAt: createApiKeyDto.expiresAt || null,
            },
        });

        return {
            id: apiKey.id,
            key: apiKey.key,
            name: apiKey.name,
            userId: apiKey.userId,
            expiresAt: apiKey.expiresAt,
            isActive: apiKey.isActive,
            createdAt: apiKey.createdAt,
        };
    }

    /**
     * List all API keys for a user (doesn't expose full key)
     */
    async listApiKeys(userId: string): Promise<ApiKeyListItem[]> {
        const apiKeys = await this.prisma.apiKey.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return apiKeys.map(apiKey => ({
            id: apiKey.id,
            name: apiKey.name,
            userId: apiKey.userId,
            expiresAt: apiKey.expiresAt,
            isActive: apiKey.isActive,
            createdAt: apiKey.createdAt,
            // Show only first 8 and last 4 characters of the key
            keyPreview: `${apiKey.key.substring(0, 11)}...${apiKey.key.slice(-4)}`,
        }));
    }

    /**
     * Revoke (deactivate) an API key
     */
    async revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { id: apiKeyId },
        });

        if (!apiKey) {
            throw new NotFoundException('API key not found');
        }

        if (apiKey.userId !== userId) {
            throw new BadRequestException('You do not have permission to revoke this API key');
        }

        await this.prisma.apiKey.update({
            where: { id: apiKeyId },
            data: { isActive: false },
        });
    }

    /**
     * Delete an API key permanently
     */
    async deleteApiKey(userId: string, apiKeyId: string): Promise<void> {
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { id: apiKeyId },
        });

        if (!apiKey) {
            throw new NotFoundException('API key not found');
        }

        if (apiKey.userId !== userId) {
            throw new BadRequestException('You do not have permission to delete this API key');
        }

        await this.prisma.apiKey.delete({
            where: { id: apiKeyId },
        });
    }

    /**
     * Get a specific API key (without exposing the full key)
     */
    async getApiKey(userId: string, apiKeyId: string): Promise<ApiKeyListItem> {
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { id: apiKeyId },
        });

        if (!apiKey) {
            throw new NotFoundException('API key not found');
        }

        if (apiKey.userId !== userId) {
            throw new BadRequestException('You do not have permission to view this API key');
        }

        return {
            id: apiKey.id,
            name: apiKey.name,
            userId: apiKey.userId,
            expiresAt: apiKey.expiresAt,
            isActive: apiKey.isActive,
            createdAt: apiKey.createdAt,
            keyPreview: `${apiKey.key.substring(0, 11)}...${apiKey.key.slice(-4)}`,
        };
    }
}
