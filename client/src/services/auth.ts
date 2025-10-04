import { RegisterRequest, ApiResponse, AuthResponse, LoginRequest, User } from '@/types/auth';
import { apiClient } from './api';

class AuthService {
    async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
            console.log('Login response:', response);

            // Store tokens
            apiClient.setTokens(
                response.data.accessToken,
                response.data.refreshToken,
                response.data.expiresIn
            );

            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            // Even if the server request fails, we should clear local tokens
            console.error('Logout request failed:', error);
        } finally {
            // Always clear tokens locally
            apiClient.removeTokens();
        }
    }

    async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
                refreshToken,
            });

            // Update tokens
            apiClient.setTokens(
                response.data.accessToken,
                response.data.refreshToken,
                response.data.expiresIn
            );

            return response;
        } catch (error) {
            // If refresh fails, clear all tokens
            apiClient.removeTokens();
            throw error;
        }
    }

    async getProfile(): Promise<ApiResponse<User>> {
        try {
            const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
            return response;
        } catch (error) {
            console.error('Failed to get user profile:', error);
            throw error;
        }
    }

    isAuthenticated(): boolean {
        return apiClient.isAuthenticated();
    }

    getAccessToken(): string | undefined {
        return apiClient.getAccessToken();
    }
}

export const authService = new AuthService();