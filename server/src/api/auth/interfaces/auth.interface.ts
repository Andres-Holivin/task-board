export interface User {
    id: string;
    email: string;
    fullName: string;
    emailConfirmed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface JwtPayload {
    sub: string; // user id
    email: string;
    iat?: number;
    exp?: number;
}

export interface SupabaseUser {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    created_at: string;
    updated_at: string;
    user_metadata: {
        full_name?: string;
    };
}