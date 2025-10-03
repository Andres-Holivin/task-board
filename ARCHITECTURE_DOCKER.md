# Task Board - Docker Architecture

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Docker Host Machine                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Docker Network: task-board-network              │ │
│  │                                                            │ │
│  │  ┌─────────────────┐                                      │ │
│  │  │   PostgreSQL    │                                      │ │
│  │  │   Container     │                                      │ │
│  │  │   Port: 5432    │                                      │ │
│  │  └────────┬────────┘                                      │ │
│  │           │                                                │ │
│  │           │ DATABASE_URL                                  │ │
│  │           │                                                │ │
│  │           ▼                                                │ │
│  │  ┌─────────────────┐                                      │ │
│  │  │   NestJS API    │                                      │ │
│  │  │   Container     │                                      │ │
│  │  │   Port: 3001    │◄──── External Traffic               │ │
│  │  └────────┬────────┘      (API Requests)                 │ │
│  │           │                                                │ │
│  │           │ API_URL                                       │ │
│  │           │                                                │ │
│  │           ▼                                                │ │
│  │  ┌─────────────────┐                                      │ │
│  │  │   Next.js Web   │                                      │ │
│  │  │   Container     │◄──── External Traffic               │ │
│  │  │   Port: 3000    │      (Browser Requests)             │ │
│  │  └─────────────────┘                                      │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Docker Volumes                           │ │
│  │                                                            │ │
│  │  ┌────────────────┐                                       │ │
│  │  │ postgres_data  │ ← Persistent database storage        │ │
│  │  └────────────────┘                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

External Access:
  Browser → http://localhost:3000 → Next.js Container
  API Client → http://localhost:3001 → NestJS Container
```

## 🔄 Request Flow

### User Registration/Login Flow
```
Browser
  │
  │ 1. POST /auth/register or /auth/login
  ▼
Next.js (Port 3000)
  │
  │ 2. Forward to API
  ▼
NestJS API (Port 3001)
  │
  │ 3. Validate with Supabase
  ▼
Supabase Auth Service
  │
  │ 4. User validated
  ▼
NestJS API
  │
  │ 5. Generate JWT token
  │ 6. Store in database
  ▼
PostgreSQL (Port 5432)
  │
  │ 7. Return token
  ▼
Browser (stores in cookie)
```

### Task CRUD Flow
```
Browser (authenticated)
  │
  │ 1. GET/POST/PUT/DELETE /tasks
  │    Headers: Authorization: Bearer <token>
  ▼
Next.js (Port 3000)
  │
  │ 2. Forward with token
  ▼
NestJS API (Port 3001)
  │
  │ 3. Verify JWT token
  │ 4. Extract user ID
  ▼
PostgreSQL (Port 5432)
  │
  │ 5. Query/Update tasks for user
  │ 6. Return filtered results
  ▼
Browser (display in Kanban)
```

### AI Suggestions Flow
```
Browser
  │
  │ 1. POST /tasks/ai-suggestions
  │    Body: { prompt: "task description" }
  ▼
Next.js (Port 3000)
  │
  │ 2. Forward to API (with timeout: 30s)
  ▼
NestJS API (Port 3001)
  │
  │ 3. Call Gemini AI
  ▼
Google Gemini API
  │
  │ 4. Generate suggestions
  │ 5. Parse response
  ▼
NestJS API
  │
  │ 6. Return suggestions
  │    (or fallback if timeout/error)
  ▼
Browser (display in dialog)
```

## 🐳 Container Details

### Frontend Container (task-board-client)
```
Base Image: node:20-alpine
Size: ~200MB (production) / ~350MB (dev)
Port: 3000
User: nextjs (non-root)

Features:
├── Multi-stage build
├── Standalone output
├── Health check endpoint
├── Auto-restart on failure
└── Environment-based config

Health Check:
  Interval: 30s
  Timeout: 10s
  Retries: 3
  Command: Check /api/health endpoint
```

### Backend Container (task-board-api)
```
Base Image: node:20-alpine
Size: ~150MB (production) / ~200MB (dev)
Port: 3001
User: nestjs (non-root)

Features:
├── Multi-stage build
├── Prisma Client generation
├── Health check endpoint
├── Auto-restart on failure
└── Signal handling (dumb-init)

Health Check:
  Interval: 30s
  Timeout: 10s
  Retries: 3
  Start Period: 60s
  Command: Check /health endpoint
```

### Database Container (task-board-postgres)
```
Base Image: postgres:16-alpine
Size: ~100MB + data
Port: 5432
User: postgres

Features:
├── Persistent volume
├── Init script support
├── Health check
├── Auto-restart on failure
└── Backup ready

Health Check:
  Interval: 10s
  Timeout: 5s
  Retries: 5
  Command: pg_isready
```

## 📊 Build Stages (Production)

### Frontend Build Stages
```
Stage 1: deps
  ├── Copy package.json, package-lock.json
  ├── Install dependencies (npm ci)
  └── Size: ~150MB

Stage 2: builder
  ├── Copy deps from stage 1
  ├── Copy source code
  ├── Build Next.js app (npm run build)
  ├── Generate standalone output
  └── Size: ~300MB

Stage 3: runner (final)
  ├── Copy standalone server
  ├── Copy static files
  ├── Create non-root user
  └── Size: ~200MB ✓
```

### Backend Build Stages
```
Stage 1: deps
  ├── Copy package.json, package-lock.json
  ├── Install dependencies (npm ci)
  └── Size: ~130MB

Stage 2: builder
  ├── Copy deps from stage 1
  ├── Copy source code
  ├── Build TypeScript (npm run build)
  ├── Generate Prisma Client
  └── Size: ~200MB

Stage 3: runner (final)
  ├── Copy node_modules from stage 1
  ├── Copy built files from stage 2
  ├── Copy Prisma files
  ├── Create non-root user
  └── Size: ~150MB ✓
```

## 🔒 Security Layers

```
Layer 1: Container Isolation
  ├── Separate containers for each service
  ├── Network isolation
  └── Resource limits

Layer 2: User Permissions
  ├── Non-root users (nextjs, nestjs)
  ├── Read-only file systems (where possible)
  └── Minimal privileges

Layer 3: Application Security
  ├── JWT authentication
  ├── Password hashing (Supabase)
  ├── Input validation (Zod, class-validator)
  └── CORS configuration

Layer 4: Network Security
  ├── Internal Docker network
  ├── Only expose necessary ports
  └── Health checks for monitoring

Layer 5: Data Security
  ├── Encrypted connections (Supabase)
  ├── Environment variable secrets
  └── Persistent volume encryption (optional)
```

## 🔄 Deployment Flow

```
1. Environment Setup
   ├── Copy .env.example → .env
   └── Fill in credentials

2. Build Phase
   ├── docker-compose build
   ├── Pull base images
   ├── Install dependencies
   ├── Build applications
   └── Create final images

3. Start Phase
   ├── docker-compose up -d
   ├── Create network
   ├── Create volumes
   ├── Start PostgreSQL
   ├── Wait for database health
   ├── Start NestJS API
   ├── Wait for API health
   └── Start Next.js

4. Migration Phase
   ├── docker-compose exec api
   └── npx prisma migrate deploy

5. Verification Phase
   ├── Check container status
   ├── Test health endpoints
   └── Verify logs
```

## 📈 Scaling Options

### Horizontal Scaling (Multiple Instances)
```
┌─────────────┐
│ Load        │
│ Balancer    │
│ (Nginx)     │
└─────┬───────┘
      │
      ├─────────────┬─────────────┬─────────────┐
      ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Client 1 │  │ Client 2 │  │ Client 3 │  │ Client N │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
      │             │             │             │
      └─────────────┴─────────────┴─────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  API Server  │
                  │  (Stateless) │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  PostgreSQL  │
                  │  (Primary)   │
                  └──────────────┘
```

### Vertical Scaling (More Resources)
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## 🔍 Monitoring Points

```
Frontend (Next.js)
  ├── /api/health → Health status
  ├── Logs → docker-compose logs client
  ├── Metrics → Response time, error rate
  └── Browser → Console errors, network tab

Backend (NestJS)
  ├── /health → Health status
  ├── Logs → docker-compose logs api
  ├── Metrics → Request count, latency
  └── Database → Connection pool status

Database (PostgreSQL)
  ├── pg_isready → Connection status
  ├── Logs → docker-compose logs postgres
  ├── Metrics → Query performance
  └── Storage → Volume usage
```

## 💾 Data Persistence

```
PostgreSQL Volume (postgres_data)
  │
  ├── /var/lib/postgresql/data
  │   ├── base/ → Database files
  │   ├── global/ → Global tables
  │   ├── pg_wal/ → Write-ahead logs
  │   └── pg_stat/ → Statistics
  │
  └── Backup Strategy
      ├── Manual: pg_dump
      ├── Automated: Cron jobs
      └── Point-in-time: WAL archiving
```

## 🔄 Update Strategy

```
1. Zero-Downtime Update
   ├── Build new images
   ├── Start new containers
   ├── Health check new containers
   ├── Switch traffic (load balancer)
   └── Stop old containers

2. Blue-Green Deployment
   ├── Deploy to "green" environment
   ├── Test green thoroughly
   ├── Switch DNS/Load Balancer
   └── Keep blue as rollback

3. Rolling Update
   ├── Update one instance at a time
   ├── Verify each update
   └── Continue if healthy
```

---

**Architecture Version:** 1.0  
**Last Updated:** October 3, 2025  
**Containers:** 3 (Frontend, Backend, Database)  
**Network:** Bridge (task-board-network)  
**Storage:** Persistent volumes
