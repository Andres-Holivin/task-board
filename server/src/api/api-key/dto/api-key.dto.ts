import { z } from 'zod';

export const createApiKeySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    expiresAt: z.coerce.date().optional().nullable(),
});

export type CreateApiKeyDTO = z.infer<typeof createApiKeySchema>;

export interface ApiKeyResponse {
    id: string;
    key: string;
    name: string;
    userId: string;
    expiresAt: Date | null;
    isActive: boolean;
    createdAt: Date;
}

export interface ApiKeyListItem {
    id: string;
    name: string;
    userId: string;
    expiresAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    // Note: We don't expose the full key in list responses for security
    keyPreview: string; // e.g., "ak_1234...5678"
}
