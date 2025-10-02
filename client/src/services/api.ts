import { ApiError } from '@/types/auth';
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const REQUEST_TIMEOUT = typeof process.env.NEXT_PUBLIC_API_TIMEOUT === 'string'
    ? parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT, 10)
    : 30000;

class ApiClient {
    private readonly client: AxiosInstance;
    private readonly activeRequests: Map<string, AbortController>;

    constructor() {
        this.activeRequests = new Map();

        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: REQUEST_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor to add auth token and abort signal
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = Cookies.get('accessToken');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add abort signal if not already present
                if (!config.signal) {
                    const controller = new AbortController();
                    config.signal = controller.signal;

                    // Store controller with request ID for potential cancellation
                    const requestId = `${config.method}-${config.url}-${Date.now()}`;
                    this.activeRequests.set(requestId, controller);

                    // Clean up after request completes
                    const cleanup = () => {
                        this.activeRequests.delete(requestId);
                    };

                    // Set timeout to abort request
                    const timeoutId = setTimeout(() => {
                        controller.abort('Request timeout');
                        cleanup();
                    }, REQUEST_TIMEOUT);

                    // Store cleanup function
                    (config as any).__cleanup = () => {
                        clearTimeout(timeoutId);
                        cleanup();
                    };
                }

                return config;
            },
            (error) => {
                return Promise.reject(new Error(error.message || 'Request failed'));
            }
        );

        // Response interceptor to handle errors and token refresh
        this.client.interceptors.response.use(
            (response) => {
                // Clean up abort controller
                const config = response.config as any;
                if (config.__cleanup) {
                    config.__cleanup();
                }
                return response;
            },
            async (error: AxiosError) => {
                // Clean up abort controller
                const config = error.config as any;
                if (config?.__cleanup) {
                    config.__cleanup();
                }

                // Handle abort/timeout errors
                if (axios.isCancel(error) || error.code === 'ECONNABORTED') {
                    console.error('Request aborted or timed out:', error.message);
                    return Promise.reject(new Error('Request was cancelled or timed out'));
                }

                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; };
                console.log('API Error:', error.response?.status, error.message, originalRequest?._retry);

                // If the error is 401 and we haven't already tried to refresh
                if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = Cookies.get('refreshToken');
                        if (refreshToken) {
                            const response = await this.client.post('/auth/refresh', {
                                refreshToken,
                            });

                            const { accessToken, refreshToken: newRefreshToken } = response.data;

                            // Update tokens in cookies
                            Cookies.set('accessToken', accessToken, { expires: 7 });
                            Cookies.set('refreshToken', newRefreshToken, { expires: 30 });

                            // Update the authorization header and retry the request
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                            }

                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed, redirect to login
                        console.error('Token refresh failed:', refreshError);
                        this.clearTokens();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/auth/login';
                        }
                        return Promise.reject(new Error('Authentication failed'));
                    }
                }

                const apiError = this.handleError(error);
                return Promise.reject(new Error(apiError.message));
            }
        );
    }

    private handleError(error: AxiosError): ApiError {
        const defaultError: ApiError = {
            message: 'An unexpected error occurred',
            statusCode: 500,
        };

        if (!error.response) {
            return {
                ...defaultError,
                message: 'Network error - please check your connection',
            };
        }

        const { status, data } = error.response;

        if (data && typeof data === 'object') {
            return {
                message: (data as any).message || defaultError.message,
                errors: (data as any).errors,
                statusCode: status,
            };
        }

        return {
            ...defaultError,
            statusCode: status,
        };
    }

    private clearTokens() {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
    }

    // Public methods for making requests
    async get<T>(url: string, config?: any): Promise<T> {
        const response = await this.client.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.post(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.put(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.patch(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: any): Promise<T> {
        const response = await this.client.delete(url, config);
        return response.data;
    }

    // Method to set tokens (used after login)
    setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        console.log('Setting tokens:', { accessToken, refreshToken, expiresIn });
        const accessTokenExpiry = expiresIn / (24 * 60 * 60); // Convert seconds to days
        Cookies.set('accessToken', accessToken, { expires: accessTokenExpiry });
        Cookies.set('refreshToken', refreshToken, { expires: 30 }); // 30 days for refresh token
    }

    // Method to clear tokens (used for logout)
    removeTokens() {
        this.clearTokens();
    }

    // Abort all pending requests
    abortAllRequests(reason?: string) {
        console.log(`Aborting ${this.activeRequests.size} active requests`, reason ? `Reason: ${reason}` : '');
        this.activeRequests.forEach((controller, requestId) => {
            controller.abort(reason || 'Request cancelled by user');
            console.log(`Aborted request: ${requestId}`);
        });
        this.activeRequests.clear();
    }

    // Abort specific request by pattern
    abortRequestsByPattern(pattern: string | RegExp, reason?: string) {
        const matchingRequests: string[] = [];

        this.activeRequests.forEach((controller, requestId) => {
            const matches = typeof pattern === 'string'
                ? requestId.includes(pattern)
                : pattern.test(requestId);

            if (matches) {
                controller.abort(reason || 'Request cancelled');
                matchingRequests.push(requestId);
            }
        });

        matchingRequests.forEach(id => this.activeRequests.delete(id));
        console.log(`Aborted ${matchingRequests.length} requests matching pattern:`, pattern);
    }

    // Get count of active requests
    getActiveRequestsCount(): number {
        return this.activeRequests.size;
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!Cookies.get('accessToken');
    }

    // Get current access token
    getAccessToken(): string | undefined {
        return Cookies.get('accessToken');
    }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;