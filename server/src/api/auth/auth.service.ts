import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LoginDto, RegisterDto } from './dto/auth.dto';
import type { AuthResponse, User, SupabaseUser } from './interfaces/auth.interface';
import type { Env } from '../../config/env';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService<Env, true>,
        private readonly supabaseService: SupabaseService,
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const { email, password, fullName } = registerDto;

        try {
            const authClient = this.supabaseService.getAuthClient();

            // Register user with Supabase Auth
            const { data, error } = await authClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    throw new ConflictException('User already exists');
                }
                throw new UnauthorizedException(error.message);
            }

            if (!data.user || !data.session) {
                throw new InternalServerErrorException('Failed to create user');
            }

            // Map Supabase user to our User interface
            const user = this.mapSupabaseUserToUser(data.user as SupabaseUser);

            // Return Supabase session tokens
            return {
                user,
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresIn: data.session.expires_in || 3600,
            };
        } catch (error) {
            if (error instanceof ConflictException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Registration failed');
        }
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const { email, password } = loginDto;

        try {
            const authClient = this.supabaseService.getAuthClient();
            console.log(email, password);
            // Authenticate with Supabase
            const { data, error } = await authClient.auth.signInWithPassword({
                email,
                password,
            });
            console.log("Login", data, error);
            if (error || !data.user || !data.session) {
                throw new UnauthorizedException(error?.message || 'Invalid credentials');
            }

            // Map Supabase user to our User interface
            const user = this.mapSupabaseUserToUser(data.user as SupabaseUser);

            // Return Supabase session tokens
            return {
                user,
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresIn: data.session.expires_in || 3600,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Login failed');
        }
    }

    async validateUser(userId: string): Promise<User | null> {
        try {
            const supabase = this.supabaseService.getClient();

            // Get user from Supabase using service role key
            const { data, error } = await supabase.auth.admin.getUserById(userId);

            if (error || !data.user) {
                return null;
            }

            return this.mapSupabaseUserToUser(data.user as SupabaseUser);
        } catch (error) {
            // Log error for debugging purposes
            console.error('Error validating user:', error);
            return null;
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const authClient = this.supabaseService.getAuthClient();

            // Verify and refresh token with Supabase
            const { data, error } = await authClient.auth.refreshSession({
                refresh_token: refreshToken,
            });
            console.log(data, error);
            if (error || !data.user || !data.session) {
                throw new UnauthorizedException(error?.message || 'Invalid refresh token');
            }

            // Map Supabase user to our User interface
            const user = this.mapSupabaseUserToUser(data.user as SupabaseUser);

            // Return new Supabase session tokens
            return {
                user,
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresIn: data.session.expires_in || 3600,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Token refresh failed');
        }
    }

    private mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
        return {
            id: supabaseUser.id,
            email: supabaseUser.email,
            fullName: supabaseUser.user_metadata?.full_name || '',
            emailConfirmed: !!supabaseUser.email_confirmed_at,
            createdAt: supabaseUser.created_at,
            updatedAt: supabaseUser.updated_at,
        };
    }
}