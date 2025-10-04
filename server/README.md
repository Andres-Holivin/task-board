# Task Board - Server

A robust NestJS backend server providing REST API for task management, featuring authentication, email notifications, API key management, and AI-powered task suggestions.

## 🚀 Features

- **Authentication API**: JWT-based authentication with Supabase
- **Task Management**: Full CRUD operations for tasks
- **Email Notifications**: Automated email system with templating
- **API Key Management**: Secure API access with key-based authentication
- **AI Integration**: Google Generative AI for task suggestions
- **Database**: PostgreSQL with Prisma ORM
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Testing**: Comprehensive unit and e2e tests with Jest
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) 11
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/) 6.16
- **Authentication**: Passport JWT + Supabase
- **Email**: Nodemailer
- **AI**: Google Generative AI (Gemini)
- **API Docs**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Validation**: class-validator + Zod

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase account (for authentication)
- Google Gemini API key (for AI features)

## 🔧 Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
Create a `.env` file in the server directory:
```env
# App Configuration
PORT=3001
NODE_ENV=development
REQUEST_TIMEOUT=30000

# Supabase Configuration
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"

# CORS Configuration
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Google AI (Gemini)
GEMINI_API_KEY="your-google-gemini-api-key"

# SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-password"
SMTP_SENDER_NAME="Task Board App"
```

**Note**: The application uses Supabase for authentication. The `SUPABASE_JWT_SECRET` can be found in your Supabase dashboard under Settings > API > JWT Settings. This secret is used to validate JWT tokens issued by Supabase.

3. **Setup database**:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run db:seed
```

4. **Run the server**:
```bash
npm run start:dev
```

The server will be available at `http://localhost:3001`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with watch mode |
| `npm run start:prod` | Start production server |
| `npm run build` | Build the application |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:ci` | Run tests in CI environment |
| `npm run lint` | Lint and fix code |
| `npm run format` | Format code with Prettier |
| `npm run db:seed` | Seed database with initial data |


## 🗄️ Database Schema
![Alt text](prisma/ERD.svg)

### Database Models

#### Task
- Manages user tasks with status tracking
- Fields: id, title, description, status, userId, createdAt, updatedAt
- Status: TODO, IN_PROGRESS, DONE
- Indexed by userId and status

#### EmailLog
- Tracks all sent emails
- Fields: id, to, subject, body, status, error, sentAt, createdAt, updatedAt
- Status: PENDING, SENT, FAILED

#### EmailTemplate
- Stores email templates
- Types: TASK_CREATED, TASK_UPDATED, TASK_DELETED, SUMMARY_TASKS_DAILY

#### ApiKey
- Manages API access keys
- Fields: id, key, name, userId, expiresAt, isActive, createdAt, updatedAt

**For detailed ERD, see:** `prisma/ERD.svg`

## 🔐 Authentication

The server supports two authentication methods:

### JWT Authentication
[![](https://mermaid.ink/img/pako:eNptkk9P20AQxb_KaK6kBExCzB6QGltCcGgBUypVvmztIVkl3nXHu4UQ5bszm7g0_PHJO7_3Zt6svcbK1YQKO_oTyFaUGz1j3ZQW5Gk1e1OZVlsPGegOsqUh6z_CIsKC-C_xJ3C6paHVv3VHH3m-5bn2Pd8psi_n54WC6-_FHQx1a4Y6-Plw6WamFxRRMFVwT2weVlAx1ZLN6GXX8-muw4-OGKI50kp7qvf8Ci7IEksVrn7egXcL2mufKbglH9juABxAiM1qiboTfXNidLI1iLTwjqlXGguVcwtDb5b5en0JHC-68_Bo_DzOfBPmXi9NHcO8C5LLnjeBeLU3O-_36xP-B33ygmwt07rW2Y5wgDM2NSrPgQbYEDc6HnEdPSXK7TRUopLXWvOixNJuxCPf55dzzT8buzCbo3qQO5ZTaGPU_od5rbKMJc5csB5VcrbtgWqNT6hOxseHp-PTNDlOT5IkOUoHuEI1Sg_TyehsMor1ZJKmmwE-b4ceCRhvXgBu6tSe?type=png)](https://mermaid.live/edit#pako:eNptkk9P20AQxb_KaK6kBExCzB6QGltCcGgBUypVvmztIVkl3nXHu4UQ5bszm7g0_PHJO7_3Zt6svcbK1YQKO_oTyFaUGz1j3ZQW5Gk1e1OZVlsPGegOsqUh6z_CIsKC-C_xJ3C6paHVv3VHH3m-5bn2Pd8psi_n54WC6-_FHQx1a4Y6-Plw6WamFxRRMFVwT2weVlAx1ZLN6GXX8-muw4-OGKI50kp7qvf8Ci7IEksVrn7egXcL2mufKbglH9juABxAiM1qiboTfXNidLI1iLTwjqlXGguVcwtDb5b5en0JHC-68_Bo_DzOfBPmXi9NHcO8C5LLnjeBeLU3O-_36xP-B33ygmwt07rW2Y5wgDM2NSrPgQbYEDc6HnEdPSXK7TRUopLXWvOixNJuxCPf55dzzT8buzCbo3qQO5ZTaGPU_od5rbKMJc5csB5VcrbtgWqNT6hOxseHp-PTNDlOT5IkOUoHuEI1Sg_TyehsMor1ZJKmmwE-b4ceCRhvXgBu6tSe)

1. User registers/logs in via Supabase
2. Server generates JWT token
3. Client includes token in Authorization header
4. Guards validate token for protected routes

### API Key Authentication
1. User generates API key via dashboard
2. Client includes key in `x-api-key` header
3. Guards validate key for API access

## 📚 API Documentation

Swagger documentation is available at:
```
http://localhost:3001/swagger
```

The interactive API explorer allows you to:
- Browse all endpoints
- Test API calls directly
- View request/response schemas
- See authentication requirements
- Download OpenAPI spec

## 🧪 Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run tests in CI
npm run test:ci

# Watch mode
npm run test:watch
```

Coverage reports are generated in `coverage/lcov-report/index.html`

## 🤖 AI Features

The server integrates Google Generative AI (Gemini) for intelligent task suggestions:

### Get Task Suggestions
```bash
GET /api/tasks/suggestions?context=Build a web application
```

**Response:**
```json
{
  "suggestions": [
    {
      "title": "Setup project repository",
      "description": "Initialize Git repository and create project structure"
    },
    {
      "title": "Design database schema",
      "description": "Create ERD and define data models"
    }
  ]
}
```

## 📧 Email System

Automated email notifications for:
- **Task Creation**: Welcome email with task details
- **Task Deletion**: Confirmation email
- **Daily Summaries**: Overview of pending tasks

Email templates are stored in the database and can be customized via the EmailTemplate model.

## 🐳 Docker Support

Build and run using Docker:

```bash
# Build the image
docker build -t task-board-server .

# Run the container
docker run -p 3001:3001 \
  -e DATABASE_URL="your-db-url" \
  -e SUPABASE_URL="your-supabase-url" \
  task-board-server
```

Or use Docker Compose:

```bash
docker-compose up -d
```

## 🔒 Security Features

- **JWT Token Authentication**: Secure token-based auth with expiration
- **API Key Management**: Revocable API keys with expiration dates
- **Password Hashing**: Handled securely by Supabase
- **CORS Protection**: Configurable CORS policies
- **Input Validation**: 
  - Zod schemas for request validation
  - class-validator for DTO validation
- **SQL Injection Protection**: Prisma parameterized queries
- **Environment Variables**: Sensitive data in .env files
- **HTTP-only Cookies**: Secure token storage (client-side)

## 🚀 Deployment

### Vercel
The project is configured for Vercel deployment:

```bash
# Build with tests
npm run vercel-build
```

Required environment variables must be set in Vercel dashboard.

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the server:
   ```bash
   npm run start:prod
   ```
   
## 🔗 Related Documentation

- [Main Project README](../README.md)
- [Client README](../client/README.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Supabase Documentation](https://supabase.com/docs)

---

**Built with ❤️ using NestJS and Prisma**


# Tests
```
$ yarn run test
$ yarn run test:e2e
$ yarn run test:cov
```

