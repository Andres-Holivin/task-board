import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { FlexibleAuthGuard } from '../../auth/guards/flexible-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { Env } from '../../config/env';
import { PrismaService } from '../../config/prisma.service';
import { SupabaseService } from '../../config/supabase.service';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService<Env, true>) => ({
                secret: configService.get('SUPABASE_JWT_SECRET', { infer: true }),
                signOptions: {
                    expiresIn: '1h', // This is just for compatibility, Supabase handles token expiry
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        SupabaseService,
        PrismaService,
        JwtStrategy,
        JwtAuthGuard,
        ApiKeyGuard,
        FlexibleAuthGuard,
    ],
    exports: [
        AuthService,
        SupabaseService,
        PrismaService,
        PassportModule,
        JwtAuthGuard,
        ApiKeyGuard,
        FlexibleAuthGuard,
    ],
})
export class AuthModule { }