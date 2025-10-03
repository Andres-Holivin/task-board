import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { LoginDto, RegisterDto } from './dto/auth.dto';
import type { AuthResponse, User, JwtPayload, SupabaseUser } from './interfaces/auth.interface';
import type { Env } from '../../config/env';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
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

            if (!data.user) {
                throw new InternalServerErrorException('Failed to create user');
            }

            // Map Supabase user to our User interface
            const user = this.mapSupabaseUserToUser(data.user as SupabaseUser);

            // Generate our own JWT tokens
            const tokens = await this.generateTokens(user);

            return {
                user,
                ...tokens,
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
            console.log(data, error);
            if (error || !data.user) {
                throw new UnauthorizedException(error?.message || 'Invalid credentials');
            }

            // Map Supabase user to our User interface
            const user = this.mapSupabaseUserToUser(data.user as SupabaseUser);

            // Generate our own JWT tokens
            const tokens = await this.generateTokens(user);

            return {
                user,
                ...tokens,
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
            if (error || !data.user) {
                throw new UnauthorizedException(error?.message || 'Invalid refresh token');
            }

            // Map Supabase user to our User interface
            const user = this.mapSupabaseUserToUser(data.user as SupabaseUser);

            // Generate new JWT tokens
            const tokens = await this.generateTokens(user);

            return {
                user,
                ...tokens,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Token refresh failed');
        }
    }

    private async generateTokens(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
        };

        const jwtExpiresIn = this.configService.get('JWT_EXPIRES_IN', { infer: true });

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: jwtExpiresIn }),
            this.jwtService.signAsync(payload, { expiresIn: '30d' }), // Refresh token expires in 30 days
        ]);

        // Calculate expiration time in seconds
        const expiresIn = this.parseExpirationTime(jwtExpiresIn);

        return {
            accessToken,
            refreshToken,
            expiresIn,
        };
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

    private parseExpirationTime(expiresIn: string): number {
        const timeUnit = expiresIn.slice(-1);
        const timeValue = parseInt(expiresIn.slice(0, -1), 10);

        switch (timeUnit) {
            case 's':
                return timeValue;
            case 'm':
                return timeValue * 60;
            case 'h':
                return timeValue * 60 * 60;
            case 'd':
                return timeValue * 24 * 60 * 60;
            default:
                return 7 * 24 * 60 * 60; // Default to 7 days
        }
    }
}