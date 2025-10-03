# Task Board - Frontend (Next.js)

A modern task management application with Kanban board, built with Next.js 15, React 19, and shadcn/ui.

## ✨ Features

- 🎨 **Kanban Board** - Drag-and-drop interface with @dnd-kit
- 🔐 **Authentication** - JWT-based auth with Supabase
- ✅ **Task Management** - Full CRUD operations
- 🤖 **AI Suggestions** - Google Gemini integration
- 🎭 **Theme Support** - Dark/light mode with next-themes
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Type-Safe** - Full TypeScript support
- 🔄 **State Management** - Zustand for reactive updates

## 🚀 Quick Start

### Development (Local)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Development (Docker)

```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up
```

### Production (Docker)

```bash
# Build and run
docker-compose build
docker-compose up -d
```

## 📦 Docker Deployment

This project includes complete Docker support:

- **Production:** Multi-stage optimized build (~200MB)
- **Development:** Hot reload with volume mounting
- **Health Checks:** Automatic monitoring and restart
- **Documentation:** Complete guides included

### Quick Deploy

```bash
# See DOCKER_README.md for complete guide
docker-compose build
docker-compose up -d
```

## 🏗️ Tech Stack

- **Framework:** Next.js 15.5.4 (App Router)
- **React:** 19.1.0
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** Zustand 5.0.8
- **HTTP Client:** Axios 1.12.2
- **Drag & Drop:** @dnd-kit
- **Styling:** Tailwind CSS 4
- **Forms:** React Hook Form + Zod validation
- **TypeScript:** Full type safety

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main Kanban dashboard
│   └── api/health/        # Health check endpoint
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── tasks/            # Task management
│   ├── navbar/           # Navigation
│   ├── providers/        # Context providers
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities
├── services/             # API services
└── types/                # TypeScript types
```

## 🔧 Configuration

### Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Next.js Config

```typescript
// next.config.ts
output: 'standalone'  // Required for Docker
```

## 🐳 Docker Files

- `Dockerfile` - Production multi-stage build
- `Dockerfile.dev` - Development with hot reload
- `docker-compose.yml` - Standalone deployment
- `docker-compose.dev.yml` - Development environment
- `.dockerignore` - Build optimization

## 📚 Documentation

- **[DOCKER_README.md](./DOCKER_README.md)** - Docker deployment guide
- **[DOCKER_SETUP_COMPLETE.md](./DOCKER_SETUP_COMPLETE.md)** - Quick reference
- **[FRONTEND_README.md](./FRONTEND_README.md)** - Frontend architecture

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🎯 Key Components

### Dashboard
Main Kanban board with drag-and-drop functionality.

### Task Dialogs
- `AddTaskDialog` - Create new tasks
- `EditTaskDialog` - Update existing tasks
- `DeleteTaskAlert` - Confirm deletion
- `AISuggestionsDialog` - AI-powered suggestions

### Authentication
- `LoginForm` - User login
- `RegisterForm` - User registration
- `ProtectedRoute` - Route protection

## 🔄 API Integration

All API calls go through `src/services/`:

- `auth.ts` - Authentication endpoints
- `tasks.ts` - Task CRUD operations
- `api.ts` - Axios instance with interceptors

### Features:
- Automatic token management
- Request timeout (30s)
- AbortController support
- Error handling

## 🎨 UI Components

Built with shadcn/ui and Radix UI:

- Alert Dialog
- Button
- Card
- Dialog
- Dropdown Menu
- Form
- Input
- Label
- Select
- And more...

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token stored in cookie
3. Token sent with every request
4. Protected routes check authentication
5. Auto-redirect to login if not authenticated

## 🚨 Error Handling

- Global error boundaries
- API error alerts
- Form validation errors
- Network timeout handling
- Graceful fallbacks

## 📊 State Management

Using Zustand for:

- Task list state
- Loading states
- Error states
- Optimistic updates

## 🎭 Theming

- Light/dark mode support
- next-themes integration
- CSS variables for colors
- Tailwind CSS utilities

## 🔍 Health Check

Health endpoint available at `/api/health`:

```json
{
  "status": "ok",
  "timestamp": "2024-10-03T10:00:00.000Z",
  "service": "task-board-client"
}
```

## 🚀 Deployment

### Docker (Recommended)

```bash
# See root DOCKER_COMPLETE.md for full stack deployment
docker-compose build
docker-compose up -d
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual

```bash
npm run build
npm run start
```

## 📈 Performance

- Server Components for faster initial load
- Image optimization with next/image
- Font optimization with next/font
- Standalone output for smaller Docker images
- Multi-stage Docker builds

## 🛠️ Development Tips

- Use dev mode for hot reload
- Check browser console for errors
- Use React DevTools for debugging
- Check Network tab for API calls
- View Zustand state with DevTools

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Backend:** [../server](../server)
- **Docker Guide:** [DOCKER_README.md](./DOCKER_README.md)
- **Full Stack:** [../DOCKER_COMPLETE.md](../DOCKER_COMPLETE.md)
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com

---

**Version:** 1.0.0  
**Node:** 20+  
**Next.js:** 15.5.4  
**React:** 19.1.0
