import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from '../config/supabase.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import type { Env } from '../config/env';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService<Env, true>) => ({
                secret: configService.get('JWT_SECRET', { infer: true }),
                signOptions: {
                    expiresIn: configService.get('JWT_EXPIRES_IN', { infer: true }),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, SupabaseService, JwtStrategy],
    exports: [AuthService, SupabaseService, PassportModule],
})
export class AuthModule { }