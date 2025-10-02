# NestJS Authentication with Supabase

This project implements a robust authentication system using NestJS and Supabase following best practices.

## Features

- **User Registration & Login** with email/password
- **JWT Authentication** with access and refresh tokens
- **Supabase Integration** for user management and authentication
- **Protected Routes** with global authentication guard
- **Input Validation** using Zod schemas
- **Type Safety** with TypeScript throughout
- **Best Practices** following NestJS conventions

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase credentials:

```env
# Application Configuration
PORT=3000
NODE_ENV=development
APP_TIMEOUT=30000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and API keys from the Settings > API section
3. Enable email authentication in Authentication > Settings
4. Configure email templates and providers as needed

### 3. Install Dependencies

```bash
cd server
yarn install
```

### 4. Start the Development Server

```bash
yarn start:dev
```

The server will start on `http://localhost:3000`.

## API Endpoints

### Public Endpoints

- `GET /` - Hello World
- `GET /health` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Protected Endpoints

- `GET /auth/profile` - Get current user profile
- `POST /auth/logout` - Logout (client-side token removal)

## API Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "fullName": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

### Access Protected Route

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Architecture

### Key Components

1. **AuthModule** - Main authentication module
2. **AuthService** - Business logic for authentication
3. **SupabaseService** - Supabase client management
4. **JwtStrategy** - Passport JWT strategy
5. **GlobalAuthGuard** - Global authentication guard with @Public decorator support
6. **ZodValidationPipe** - Request validation using Zod schemas

### Best Practices Implemented

1. **Separation of Concerns** - Clear separation between authentication logic, validation, and HTTP handling
2. **Type Safety** - Full TypeScript coverage with strict typing
3. **Input Validation** - Comprehensive validation using Zod schemas
4. **Error Handling** - Proper error responses and exception handling
5. **Security** - JWT tokens, password requirements, and secure configuration
6. **Modularity** - Well-organized module structure for maintainability
7. **Configuration Management** - Environment-based configuration with validation

### Security Features

- Password strength requirements (8+ chars, uppercase, lowercase, number)
- JWT tokens with configurable expiration
- Refresh token support for seamless user experience
- Global authentication with selective public endpoints
- CORS configuration for frontend integration
- Input sanitization and validation

## Development Notes

- All routes are protected by default; use `@Public()` decorator for public routes
- JWT tokens are signed with your secret and include user ID and email
- Refresh tokens have longer expiration (30 days) for better UX
- Error responses follow consistent format with proper HTTP status codes
- Zod validation provides detailed error messages for invalid inputs

## Testing

You can test the authentication flow using the provided cURL examples or tools like Postman. Make sure to:

1. Register a new user
2. Login to get tokens
3. Use the access token for protected routes
4. Use the refresh token when the access token expires

## Production Considerations

1. Use a strong JWT secret (32+ characters)
2. Configure proper CORS origins
3. Set up email templates in Supabase
4. Configure rate limiting
5. Add logging and monitoring
6. Use HTTPS in production
7. Consider implementing token blacklisting for logout