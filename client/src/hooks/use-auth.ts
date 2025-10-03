import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/services/auth';
import { useEffect, useMemo } from 'react';
import { redirect } from 'next/navigation';
import { LoginRequest, RegisterRequest, User, AuthState } from '@/types/auth';
import { toast } from 'sonner';

interface AuthActions {
    // Auth actions
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokenAction: () => Promise<void>;

    // User actions
    fetchProfile: () => Promise<void>;

    // State management
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;

    // Auth check
    checkAuth: () => Promise<void>;

    // Reset store
    reset: () => void;
}

interface AuthStore extends AuthState, AuthActions { }

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Auth actions
            login: async (credentials: LoginRequest) => {
                toast.loading('Logging in...', { id: 'login' });
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.login(credentials);

                    set({
                        user: response.data.user,
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    toast.success('Logged in successfully', { id: 'login' });
                } catch (error) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : 'Login failed. Please try again.';

                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                    });
                    toast.error(errorMessage, { id: 'login' });
                    throw error;
                }
            },

            register: async (userData: RegisterRequest) => {
                try {
                    toast.loading('Registering...', { id: 'register' });
                    set({ isLoading: true, error: null });

                    const response = await authService.register(userData);

                    set({
                        user: response.data.user,
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    toast.success('Registered successfully');
                } catch (error) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : 'Registration failed. Please try again.';

                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                    });
                    toast.error(errorMessage, { id: 'register' });

                    throw error;
                }
            },

            logout: async () => {
                try {
                    toast.loading('Logging out...', { id: 'logout' });
                    set({ isLoading: true });

                    await authService.logout();

                    set({ ...initialState, isLoading: false });
                } catch (error) {
                    // Even if logout request fails, we should clear the state
                    console.error('Logout error:', error);
                    set({
                        ...initialState,
                        isLoading: false,
                    });
                }
                toast.success('Logged out successfully', { id: 'logout' });
            },

            refreshTokenAction: async () => {
                try {
                    console.log('Refreshing token...');
                    const { refreshToken } = get();

                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    set({ isLoading: true, error: null });

                    const response = await authService.refreshToken(refreshToken);

                    set({
                        user: response.data.user,
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    console.log('Token refreshed successfully');
                } catch (error) {
                    console.error('Token refresh failed:', error);

                    // Clear auth state if refresh fails
                    set({
                        ...initialState,
                        isLoading: false,
                        error: 'Session expired. Please login again.',
                    });

                    throw error;
                }
            },

            // User actions
            fetchProfile: async () => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.getProfile();
                    console.log('Fetched user profile:', response.data);
                    set({
                        user: response.data,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : 'Failed to fetch profile';

                    set({
                        isLoading: false,
                        error: errorMessage,
                    });

                    throw error;
                }
            },

            // State management
            setUser: (user: User | null) => {
                set({ user, isAuthenticated: !!user });
            },

            setLoading: (isLoading: boolean) => {
                set({ isLoading });
            },

            setError: (error: string | null) => {
                set({ error });
            },

            clearError: () => {
                set({ error: null });
            },

            // Auth check
            checkAuth: async () => {
                console.log('Checking auth status...');
                try {
                    const isAuthenticated = authService.isAuthenticated();
                    if (isAuthenticated) {
                        // Verify the token by fetching profile
                        await get().fetchProfile();
                        set({ isAuthenticated: true });
                    } else {
                        // Clear auth state if no token
                        set({
                            ...initialState,
                        });
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // Clear auth state if verification fails
                    set({
                        ...initialState,
                    });
                }
            },

            // Reset store
            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => {
                // SSR-safe localStorage check
                if (typeof window !== 'undefined') {
                    return localStorage;
                }
                // Return a no-op storage for SSR
                return {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                // Don't persist tokens in localStorage (they're in cookies)
                // Don't persist loading and error states
            }),
            skipHydration: true, // Skip hydration to avoid SSR issues
        }
    )
);

// Custom hook to handle hydration for SSR compatibility
export const useAuthHydration = () => {
    useEffect(() => {
        useAuthStore.persist.rehydrate();
    }, []);
};

// Optimized actions hook that doesn't cause re-renders by using stable references
interface UseAuthActionsOptions {
    enable?: boolean; // Whether to enforce authentication check
    redirectTo?: string; // Path to redirect if not authenticated
}

export const useAuthActions = (options?: UseAuthActionsOptions) => {
    const { enable = false, redirectTo = "/auth/login" } = options || {};

    const login = useAuthStore((state) => state.login);
    const register = useAuthStore((state) => state.register);
    const logout = useAuthStore((state) => state.logout);
    const refreshToken = useAuthStore((state) => state.refreshTokenAction);
    const fetchProfile = useAuthStore((state) => state.fetchProfile);
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const setError = useAuthStore((state) => state.setError);
    const clearError = useAuthStore((state) => state.clearError);
    const reset = useAuthStore((state) => state.reset);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (enable) {
        if (!isAuthenticated) {
            redirect(redirectTo);
        }
    }

    return useMemo(() => ({
        isLoading,
        error,
        user,
        isAuthenticated,
        login,
        register,
        logout,
        refreshToken,
        fetchProfile,
        checkAuth,
        setError,
        clearError,
        reset,
    }),
        [
            isLoading,
            error,
            user,
            isAuthenticated,
            login,
            register,
            logout,
            refreshToken,
            fetchProfile,
            checkAuth,
            setError,
            clearError,
            reset
        ]
    );
};