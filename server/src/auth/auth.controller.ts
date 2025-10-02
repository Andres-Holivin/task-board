import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import {
    loginSchema,
    registerSchema,
    refreshTokenSchema,
    type LoginDto,
    type RegisterDto,
    type RefreshTokenDto
} from './dto/auth.dto';
import type { AuthResponse, User } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto,
    ): Promise<AuthResponse> {
        return this.authService.register(registerDto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body(new ZodValidationPipe(loginSchema)) loginDto: LoginDto,
    ): Promise<AuthResponse> {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Body(new ZodValidationPipe(refreshTokenSchema)) refreshTokenDto: RefreshTokenDto,
    ): Promise<AuthResponse> {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: User): Promise<User> {
        return user;
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(): Promise<{ message: string }> {
        // For JWT tokens, logout is handled on the client side
        // Here you could implement token blacklisting if needed
        return { message: 'Logged out successfully' };
    }
}