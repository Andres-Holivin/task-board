import { Request } from 'express';

export interface AuthenticatedUser {
    userId: string;
    authMethod?: 'jwt' | 'api-key';
}

export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}
