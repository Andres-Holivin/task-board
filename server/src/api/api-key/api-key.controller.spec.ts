import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../auth/interfaces/auth.interface';
import { CreateApiKeyDTO, ApiKeyResponse, ApiKeyListItem } from './dto/api-key.dto';

describe('ApiKeyController', () => {
    let controller: ApiKeyController;
    let apiKeyService: ApiKeyService;

    const mockApiKeyService = {
        createApiKey: jest.fn(),
        listApiKeys: jest.fn(),
        getApiKey: jest.fn(),
        revokeApiKey: jest.fn(),
        deleteApiKey: jest.fn(),
    };

    const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        emailConfirmed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const mockApiKeyResponse: ApiKeyResponse = {
        id: 'key-123',
        key: 'ak_1234567890abcdef',
        name: 'Test API Key',
        userId: 'user-123',
        expiresAt: null,
        isActive: true,
        createdAt: new Date(),
    };

    const mockApiKeyListItem: ApiKeyListItem = {
        id: 'key-123',
        name: 'Test API Key',
        userId: 'user-123',
        expiresAt: null,
        isActive: true,
        createdAt: new Date(),
        keyPreview: 'ak_1234...cdef',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApiKeyController],
            providers: [
                {
                    provide: ApiKeyService,
                    useValue: mockApiKeyService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<ApiKeyController>(ApiKeyController);
        apiKeyService = module.get<ApiKeyService>(ApiKeyService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createApiKey', () => {
        it('should create a new API key successfully', async () => {
            const createApiKeyDto: CreateApiKeyDTO = {
                name: 'New API Key',
                expiresAt: null,
            };

            mockApiKeyService.createApiKey.mockResolvedValue(mockApiKeyResponse);

            const result = await controller.createApiKey(mockUser, createApiKeyDto);

            expect(apiKeyService.createApiKey).toHaveBeenCalledWith(mockUser.id, createApiKeyDto);
            expect(result).toEqual(mockApiKeyResponse);
            expect(result.key).toBeDefined();
        });

        it('should create an API key with expiration date', async () => {
            const expirationDate = new Date('2025-12-31');
            const createApiKeyDto: CreateApiKeyDTO = {
                name: 'Expiring API Key',
                expiresAt: expirationDate,
            };

            const expiringKey = { ...mockApiKeyResponse, expiresAt: expirationDate };
            mockApiKeyService.createApiKey.mockResolvedValue(expiringKey);

            const result = await controller.createApiKey(mockUser, createApiKeyDto);

            expect(apiKeyService.createApiKey).toHaveBeenCalledWith(mockUser.id, createApiKeyDto);
            expect(result.expiresAt).toEqual(expirationDate);
        });

        it('should throw error when API key creation fails', async () => {
            const createApiKeyDto: CreateApiKeyDTO = {
                name: 'Failed API Key',
                expiresAt: null,
            };

            const error = new Error('Database error');
            mockApiKeyService.createApiKey.mockRejectedValue(error);

            await expect(controller.createApiKey(mockUser, createApiKeyDto)).rejects.toThrow(error);
            expect(apiKeyService.createApiKey).toHaveBeenCalledWith(mockUser.id, createApiKeyDto);
        });
    });

    describe('listApiKeys', () => {
        it('should return all API keys for authenticated user', async () => {
            const mockApiKeys = [
                mockApiKeyListItem,
                { ...mockApiKeyListItem, id: 'key-456', name: 'Another Key' },
            ];
            mockApiKeyService.listApiKeys.mockResolvedValue(mockApiKeys);

            const result = await controller.listApiKeys(mockUser);

            expect(apiKeyService.listApiKeys).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockApiKeys);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when user has no API keys', async () => {
            mockApiKeyService.listApiKeys.mockResolvedValue([]);

            const result = await controller.listApiKeys(mockUser);

            expect(apiKeyService.listApiKeys).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should not expose full API keys in list', async () => {
            const mockApiKeys = [mockApiKeyListItem];
            mockApiKeyService.listApiKeys.mockResolvedValue(mockApiKeys);

            const result = await controller.listApiKeys(mockUser);

            expect(result[0]).toHaveProperty('keyPreview');
            expect(result[0]).not.toHaveProperty('key');
        });
    });

    describe('getApiKey', () => {
        it('should return a specific API key by ID', async () => {
            const keyId = 'key-123';
            mockApiKeyService.getApiKey.mockResolvedValue(mockApiKeyResponse);

            const result = await controller.getApiKey(mockUser, keyId);

            expect(apiKeyService.getApiKey).toHaveBeenCalledWith(mockUser.id, keyId);
            expect(result).toEqual(mockApiKeyResponse);
        });

        it('should throw error when API key is not found', async () => {
            const keyId = 'non-existent-key';
            const error = new Error('API key not found');
            mockApiKeyService.getApiKey.mockRejectedValue(error);

            await expect(controller.getApiKey(mockUser, keyId)).rejects.toThrow(error);
            expect(apiKeyService.getApiKey).toHaveBeenCalledWith(mockUser.id, keyId);
        });

        it('should throw error when user tries to access another user API key', async () => {
            const keyId = 'key-456';
            const error = new Error('Unauthorized access');
            mockApiKeyService.getApiKey.mockRejectedValue(error);

            await expect(controller.getApiKey(mockUser, keyId)).rejects.toThrow(error);
            expect(apiKeyService.getApiKey).toHaveBeenCalledWith(mockUser.id, keyId);
        });
    });

    describe('revokeApiKey', () => {
        it('should revoke an API key successfully', async () => {
            const keyId = 'key-123';
            mockApiKeyService.revokeApiKey.mockResolvedValue(undefined);

            const result = await controller.revokeApiKey(mockUser, keyId);

            expect(apiKeyService.revokeApiKey).toHaveBeenCalledWith(mockUser.id, keyId);
            expect(result).toEqual({ message: 'API key revoked successfully' });
        });

        it('should throw error when API key is not found', async () => {
            const keyId = 'non-existent-key';
            const error = new Error('API key not found');
            mockApiKeyService.revokeApiKey.mockRejectedValue(error);

            await expect(controller.revokeApiKey(mockUser, keyId)).rejects.toThrow(error);
            expect(apiKeyService.revokeApiKey).toHaveBeenCalledWith(mockUser.id, keyId);
        });

        it('should throw error when trying to revoke already revoked key', async () => {
            const keyId = 'key-123';
            const error = new Error('API key already revoked');
            mockApiKeyService.revokeApiKey.mockRejectedValue(error);

            await expect(controller.revokeApiKey(mockUser, keyId)).rejects.toThrow(error);
            expect(apiKeyService.revokeApiKey).toHaveBeenCalledWith(mockUser.id, keyId);
        });
    });

    describe('deleteApiKey', () => {
        it('should delete an API key successfully', async () => {
            const keyId = 'key-123';
            mockApiKeyService.deleteApiKey.mockResolvedValue(undefined);

            const result = await controller.deleteApiKey(mockUser, keyId);

            expect(apiKeyService.deleteApiKey).toHaveBeenCalledWith(mockUser.id, keyId);
            expect(result).toEqual({ message: 'API key deleted successfully' });
        });

        it('should throw error when API key is not found', async () => {
            const keyId = 'non-existent-key';
            const error = new Error('API key not found');
            mockApiKeyService.deleteApiKey.mockRejectedValue(error);

            await expect(controller.deleteApiKey(mockUser, keyId)).rejects.toThrow(error);
            expect(apiKeyService.deleteApiKey).toHaveBeenCalledWith(mockUser.id, keyId);
        });

        it('should throw error when user tries to delete another user API key', async () => {
            const keyId = 'key-456';
            const error = new Error('Unauthorized access');
            mockApiKeyService.deleteApiKey.mockRejectedValue(error);

            await expect(controller.deleteApiKey(mockUser, keyId)).rejects.toThrow(error);
            expect(apiKeyService.deleteApiKey).toHaveBeenCalledWith(mockUser.id, keyId);
        });
    });
});
