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

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

export interface ApiError {
    message: string;
    errors?: string[] | Record<string, string>;
    statusCode?: number;
}

export interface ApiResponse<T> {
    data: T;
    error?: ApiError;
    message?: string;
    statusCode?: number;
    success?: boolean;
}