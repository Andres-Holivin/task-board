import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Env } from '../../config/env';
import type { JwtPayload, User } from '../../api/auth/interfaces/auth.interface';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService<Env, true>,
        private readonly supabaseService: SupabaseService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('SUPABASE_JWT_SECRET', { infer: true }),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        try {
            const supabase = this.supabaseService.getClient();

            // Get user from Supabase using service role key
            const { data, error } = await supabase.auth.admin.getUserById(payload.sub);

            if (error || !data.user) {
                throw new UnauthorizedException('Invalid token');
            }

            // Map Supabase user to our User interface
            const user: User = {
                id: data.user.id,
                email: data.user.email!,
                fullName: data.user.user_metadata?.full_name || '',
                emailConfirmed: !!data.user.email_confirmed_at,
                createdAt: data.user.created_at,
                updatedAt: data.user.updated_at || data.user.created_at,
            };

            return user;
        } catch (error) {
            // Log the error for debugging
            console.error('JWT validation error:', error);
            throw new UnauthorizedException('Invalid token');
        }
    }
}