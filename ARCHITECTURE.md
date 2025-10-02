# Task Board - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend (Port 3000)             │   │
│  │                                                              │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │   │
│  │  │              │    │              │    │              │ │   │
│  │  │  Dashboard   │───▶│   Dialogs    │───▶│  Components  │ │   │
│  │  │    Page      │    │ (Add/Edit)   │    │  (Kanban UI) │ │   │
│  │  │              │    │              │    │              │ │   │
│  │  └──────┬───────┘    └──────────────┘    └──────────────┘ │   │
│  │         │                                                   │   │
│  │         ▼                                                   │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │           Zustand Store (use-tasks.ts)                │ │   │
│  │  │  • tasks: Task[]                                      │ │   │
│  │  │  • fetchTasks()                                       │ │   │
│  │  │  • createTask()                                       │ │   │
│  │  │  • updateTask()                                       │ │   │
│  │  │  • deleteTask()                                       │ │   │
│  │  │  • getSuggestions()                                   │ │   │
│  │  └────────────────────┬─────────────────────────────────┘ │   │
│  │                       │                                    │   │
│  │                       ▼                                    │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │         API Service Layer (tasks.ts)                  │ │   │
│  │  │  • axios instance with auth interceptor               │ │   │
│  │  │  • tasksApi.getAll()                                  │ │   │
│  │  │  • tasksApi.create()                                  │ │   │
│  │  │  • tasksApi.update()                                  │ │   │
│  │  │  • tasksApi.delete()                                  │ │   │
│  │  │  • tasksApi.getSuggestions()                          │ │   │
│  │  └────────────────────┬─────────────────────────────────┘ │   │
│  └───────────────────────┼─────────────────────────────────────┘   │
│                          │                                          │
│                          │ HTTP Requests (Bearer Token)             │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NestJS Backend (Port 3001)                       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Auth Middleware                            │  │
│  │  • JWT validation                                             │  │
│  │  • User extraction from token                                 │  │
│  └───────────────────────┬──────────────────────────────────────┘  │
│                          │                                          │
│                          ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Tasks Controller (tasks.controller.ts)           │  │
│  │                                                                │  │
│  │  GET    /tasks              → findAll()                       │  │
│  │  GET    /tasks/:id          → findOne()                       │  │
│  │  POST   /tasks              → create()                        │  │
│  │  PATCH  /tasks/:id          → update()                        │  │
│  │  DELETE /tasks/:id          → remove()                        │  │
│  │  GET    /tasks/suggestions  → getSuggestions()                │  │
│  └───────────────┬───────────────────────┬──────────────────────┘  │
│                  │                       │                          │
│                  ▼                       ▼                          │
│  ┌───────────────────────────┐  ┌─────────────────────────────┐   │
│  │    Tasks Service          │  │      AI Service              │   │
│  │ (tasks.service.ts)        │  │  (ai.service.ts)             │   │
│  │                           │  │                              │   │
│  │  • create(userId, dto)    │  │  • generateTaskSuggestions() │   │
│  │  • findAll(userId)        │  │  • Calls Gemini AI API       │   │
│  │  • findOne(id, userId)    │  │  • Fallback suggestions      │   │
│  │  • update(id, userId, dto)│  │                              │   │
│  │  • remove(id, userId)     │  │                              │   │
│  └─────────┬─────────────────┘  └──────────────┬───────────────┘   │
│            │                                    │                   │
│            ▼                                    ▼                   │
│  ┌──────────────────┐                ┌─────────────────────┐       │
│  │  Prisma Client   │                │  Google Gemini AI   │       │
│  │  (ORM)           │                │  API                │       │
│  └────────┬─────────┘                └─────────────────────┘       │
│           │                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                           │
│                         (Supabase)                                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     tasks Table                               │  │
│  │                                                                │  │
│  │  • id: UUID (PK)                                              │  │
│  │  • title: String                                              │  │
│  │  • description: String (nullable)                             │  │
│  │  • status: Enum (TODO, IN_PROGRESS, DONE)                    │  │
│  │  • userId: String                                             │  │
│  │  • createdAt: DateTime                                        │  │
│  │  • updatedAt: DateTime                                        │  │
│  │                                                                │  │
│  │  Indexes:                                                      │  │
│  │  • userId                                                      │  │
│  │  • status                                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Creating a Task

```
User fills form
    ↓
AddTaskDialog component
    ↓
useTasksStore.createTask(data)
    ↓
tasksApi.create(data) [Axios]
    ↓
POST /tasks [HTTP Request with JWT]
    ↓
TasksController.create()
    ↓
TasksService.create(userId, data)
    ↓
Prisma Client INSERT
    ↓
PostgreSQL Database
    ↓
← Return Task object
    ↓
← Update Zustand Store
    ↓
← Re-render Kanban Board
    ↓
User sees new task
```

### 2. Drag & Drop Task

```
User drags task to new column
    ↓
Kanban onDataChange()
    ↓
useTasksStore.updateTask(id, { status })
    ↓
tasksApi.update(id, { status }) [Axios]
    ↓
PATCH /tasks/:id [HTTP Request with JWT]
    ↓
TasksController.update()
    ↓
TasksService.update(id, userId, data)
    ↓
Prisma Client UPDATE
    ↓
PostgreSQL Database
    ↓
← Return updated Task
    ↓
← Update Zustand Store
    ↓
← Re-render Kanban Board
    ↓
User sees task in new column
```

### 3. AI Suggestion Generation

```
User clicks "AI Suggestions"
    ↓
Opens AiSuggestionsDialog
    ↓
User enters context (optional)
    ↓
Click "Generate Suggestions"
    ↓
useTasksStore.getSuggestions(context)
    ↓
tasksApi.getSuggestions(context) [Axios]
    ↓
GET /tasks/suggestions?context=... [HTTP Request with JWT]
    ↓
TasksController.getSuggestions()
    ↓
AiService.generateTaskSuggestions(context)
    ↓
Google Gemini AI API call
    ↓
← Return 5 task suggestions
    ↓
← Parse and format suggestions
    ↓
User selects desired suggestions
    ↓
Click "Add Selected"
    ↓
For each selected suggestion:
    useTasksStore.createTask(suggestion)
    ↓
Tasks created in database
    ↓
← Update Zustand Store
    ↓
← Re-render Kanban Board
    ↓
User sees new tasks
```

## Component Hierarchy

```
Dashboard Page
├── ProtectedRoute (HOC)
├── Header
│   ├── "AI Suggestions" Button → AiSuggestionsDialog
│   └── "Add Task" Button → AddTaskDialog
├── KanbanProvider
│   └── KanbanBoard (3 columns)
│       ├── Todo Column
│       │   └── KanbanCards
│       │       └── KanbanCard[]
│       │           └── Task actions (Edit/Delete)
│       ├── In Progress Column
│       │   └── KanbanCards
│       │       └── KanbanCard[]
│       │           └── Task actions (Edit/Delete)
│       └── Done Column
│           └── KanbanCards
│               └── KanbanCard[]
│                   └── Task actions (Edit/Delete)
├── AddTaskDialog (Form)
├── EditTaskDialog (Form)
├── DeleteTaskAlert (Confirmation)
└── AiSuggestionsDialog
    ├── Context Input
    ├── Generate Button
    ├── Suggestions List (selectable cards)
    └── Add Selected Button
```

## State Management Flow

```
┌─────────────────────────────────────────┐
│        Zustand Store State              │
│                                         │
│  tasks: [                               │
│    {                                    │
│      id: "uuid-1",                      │
│      title: "Task 1",                   │
│      description: "Description",        │
│      status: "TODO",                    │
│      userId: "user-1",                  │
│      createdAt: "2025-10-02",           │
│      updatedAt: "2025-10-02"            │
│    },                                   │
│    ...                                  │
│  ]                                      │
│  isLoading: false                       │
│  error: null                            │
│                                         │
└─────────────────────────────────────────┘
         ↓                    ↑
         ↓ Actions            ↑ Updates
         ↓                    ↑
┌────────────────────────────────────────┐
│       React Components                 │
│                                        │
│  • Read state with selectors           │
│  • Dispatch actions on user events     │
│  • Re-render on state changes          │
└────────────────────────────────────────┘
```

## Authentication Flow

```
Login → JWT Token → Stored in Cookies → Sent with every request
                       ↓
                 accessToken (7 days)
                 refreshToken (30 days)
                       ↓
            Axios Interceptor adds to headers
                       ↓
              Authorization: Bearer <token>
                       ↓
            Backend validates token
                       ↓
            Extracts userId from token
                       ↓
          Used for data filtering/ownership
```

## Key Design Decisions

### Why Zustand?
- Simple, lightweight state management
- No boilerplate (unlike Redux)
- TypeScript support
- Easy to test

### Why Axios over Fetch?
- Automatic request/response transforms
- Interceptors for auth
- Better error handling
- Timeout support

### Why Prisma?
- Type-safe database queries
- Auto-generated types
- Database migrations
- Multi-database support

### Why shadcn/ui?
- Copy-paste components (not npm package)
- Fully customizable
- Built on Radix UI (accessibility)
- Tailwind CSS styling

### Why Kanban Board?
- Visual task management
- Drag-and-drop intuitive
- Status progression clear
- Industry standard

## Security Features

1. **Authentication**
   - JWT-based auth
   - HttpOnly cookies (if configured)
   - Token expiration
   - Refresh token rotation

2. **Authorization**
   - User-specific data filtering
   - Ownership verification
   - Protected routes
   - Guard middleware

3. **Input Validation**
   - DTOs with class-validator
   - Zod schemas on frontend
   - SQL injection prevention (Prisma)
   - XSS protection (React)

4. **API Security**
   - CORS configuration
   - Rate limiting (configurable)
   - Error message sanitization
   - Environment variable secrets

## Performance Optimizations

1. **Frontend**
   - React.memo for expensive components
   - useMemo for computed values
   - Lazy loading for routes
   - Debounced AI suggestions

2. **Backend**
   - Database indexing (userId, status)
   - Connection pooling (Prisma)
   - Async/await for non-blocking
   - Caching (configurable)

3. **Database**
   - Efficient queries (select specific fields)
   - Indexes on frequent lookups
   - Connection pooling
   - Query optimization

## Scalability Considerations

### Current Setup (Development)
- Single server instance
- Direct database connection
- Synchronous operations

### Production Recommendations
- Load balancer for frontend
- Multiple backend instances
- Redis for caching
- WebSocket for real-time updates
- CDN for static assets
- Database read replicas
- Queue for AI requests (Bull/BullMQ)

---

This architecture provides a solid foundation for a production-ready task management application with AI integration.
