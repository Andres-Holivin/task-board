# Task Board - Setup Guide

This is a comprehensive task board application with AI-powered task suggestions using Gemini AI.

## Features

✨ **Task Management**
- ✅ Create, edit, and delete tasks
- ✅ Drag-and-drop Kanban board
- ✅ Three status columns: Todo, In Progress, Done
- ✅ Task descriptions and metadata

🤖 **AI Integration**
- ✅ Generate task suggestions using Gemini AI
- ✅ Context-aware recommendations
- ✅ Select and add multiple suggestions at once

🎨 **Modern UI**
- ✅ Built with Next.js 15 and React 19
- ✅ Styled with Tailwind CSS and shadcn/ui
- ✅ Dark/Light mode support
- ✅ Responsive design

🔐 **Authentication**
- ✅ Supabase Auth integration
- ✅ JWT-based authentication
- ✅ Protected routes

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth + JWT
- **AI**: Google Gemini AI

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (Supabase recommended)
- Google Gemini API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

#### Server (.env)
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_jwt_secret_min_32_characters
JWT_EXPIRES_IN=7d

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

#### Client (.env.local)
Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000
```

### 3. Database Setup

```bash
cd server

# Generate Prisma Client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 4. Get API Keys

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon public → `SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`
5. Copy Database URL from Settings > Database → `DATABASE_URL`

#### Google Gemini AI
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Copy it to `GEMINI_API_KEY`

**📖 For detailed Gemini setup and troubleshooting, see [GEMINI_API_SETUP.md](server/GEMINI_API_SETUP.md)**

**Common Issues:**
- Quota exceeded: Wait 1 minute or enable billing
- Invalid API key: Regenerate from AI Studio
- Model not found: App uses `gemini-pro` (most stable and widely available)
- Fallback mode: App works without AI key (uses smart fallback suggestions)

### 5. Run the Application

#### Terminal 1 - Backend
```bash
cd server
npm run start:dev
# Server will run on http://localhost:3001
```

#### Terminal 2 - Frontend
```bash
cd client
npm run dev
# Client will run on http://localhost:3000
```

## Project Structure

```
task-board/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   │   ├── tasks/    # Task management components
│   │   │   └── ui/       # shadcn/ui components
│   │   ├── hooks/        # Custom hooks (Zustand stores)
│   │   ├── services/     # API services (Axios)
│   │   ├── types/        # TypeScript types
│   │   └── lib/          # Utilities
│   └── package.json
│
└── server/                # NestJS backend
    ├── src/
    │   ├── auth/         # Authentication module
    │   ├── tasks/        # Tasks module
    │   │   ├── dto/     # Data transfer objects
    │   │   ├── interfaces/ # TypeScript interfaces
    │   │   ├── ai.service.ts    # AI integration
    │   │   ├── tasks.service.ts # Task business logic
    │   │   └── tasks.controller.ts # REST endpoints
    │   └── config/       # Configuration
    ├── prisma/
    │   └── schema.prisma # Database schema
    └── package.json
```

## API Endpoints

### Tasks
- `GET /tasks` - Get all user tasks
- `GET /tasks/:id` - Get a specific task
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `GET /tasks/suggestions` - Get AI task suggestions

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh access token

## Key Features Explanation

### Zustand State Management
The app uses Zustand for simple, scalable state management:
- `useTasksStore` in `client/src/hooks/use-tasks.ts`
- Manages tasks CRUD operations
- Integrates with AI suggestions

### AI Task Suggestions
1. User clicks "AI Suggestions" button
2. Optionally provides context
3. Backend calls Gemini AI API
4. Returns 5 relevant task suggestions
5. User can select and add multiple tasks

### Drag & Drop Kanban
- Uses @dnd-kit for smooth drag-and-drop
- Automatically updates task status
- Real-time sync with backend

## Development Tips

### Adding New Components
```bash
cd client
npx shadcn@latest add [component-name]
```

### Database Changes
```bash
cd server
# After modifying schema.prisma
npx prisma migrate dev --name migration_name
npx prisma generate
```

### Type Safety
Both frontend and backend use TypeScript with strict mode for type safety.

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL is running
- Ensure database exists

### AI Suggestions Not Working
- Verify `GEMINI_API_KEY` is valid
- Check API quota limits
- Review server logs for errors

## Best Practices

1. **State Management**: Use Zustand for global state, React state for local UI state
2. **API Calls**: All API calls go through `services/` layer
3. **Type Safety**: Define interfaces for all data structures
4. **Error Handling**: Always catch and display user-friendly errors
5. **Code Reusability**: Create reusable components in `components/`

## Contributing

When adding new features:
1. Create feature branch
2. Follow existing code patterns
3. Add TypeScript types
4. Test thoroughly
5. Update this README if needed

## License

MIT

---

Built with ❤️ using Next.js, NestJS, Prisma, and Gemini AI
