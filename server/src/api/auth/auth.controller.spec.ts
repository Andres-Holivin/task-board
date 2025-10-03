import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthResponse, User } from './interfaces/auth.interface';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        refreshToken: jest.fn(),
    };

    const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        emailConfirmed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const mockAuthResponse: AuthResponse = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto: RegisterDto = {
                email: 'newuser@example.com',
                password: 'SecurePass123!',
                fullName: 'New User',
            };

            mockAuthService.register.mockResolvedValue(mockAuthResponse);

            const result = await controller.register(registerDto);

            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual(mockAuthResponse);
        });

        it('should throw error when registration fails', async () => {
            const registerDto: RegisterDto = {
                email: 'existing@example.com',
                password: 'SecurePass123!',
                fullName: 'Existing User',
            };

            const error = new Error('User already exists');
            mockAuthService.register.mockRejectedValue(error);

            await expect(controller.register(registerDto)).rejects.toThrow(error);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'SecurePass123!',
            };

            mockAuthService.login.mockResolvedValue(mockAuthResponse);

            const result = await controller.login(loginDto);

            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(mockAuthResponse);
        });

        it('should throw error when credentials are invalid', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'WrongPassword',
            };

            const error = new Error('Invalid credentials');
            mockAuthService.login.mockRejectedValue(error);

            await expect(controller.login(loginDto)).rejects.toThrow(error);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            const refreshTokenDto: RefreshTokenDto = {
                refreshToken: 'valid-refresh-token',
            };

            mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse);

            const result = await controller.refreshToken(refreshTokenDto);

            expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
            expect(result).toEqual(mockAuthResponse);
        });

        it('should throw error when refresh token is invalid', async () => {
            const refreshTokenDto: RefreshTokenDto = {
                refreshToken: 'invalid-refresh-token',
            };

            const error = new Error('Invalid refresh token');
            mockAuthService.refreshToken.mockRejectedValue(error);

            await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(error);
            expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const result = await controller.getProfile(mockUser);

            expect(result).toEqual(mockUser);
        });

        it('should return correct user when different user is authenticated', async () => {
            const differentUser: User = {
                id: 'user-456',
                email: 'different@example.com',
                fullName: 'Different User',
                emailConfirmed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const result = await controller.getProfile(differentUser);

            expect(result).toEqual(differentUser);
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            const result = await controller.logout();

            expect(result).toEqual({ message: 'Logged out successfully' });
        });

        it('should always return success message', async () => {
            const result1 = await controller.logout();
            const result2 = await controller.logout();

            expect(result1).toEqual({ message: 'Logged out successfully' });
            expect(result2).toEqual({ message: 'Logged out successfully' });
        });
    });
});
