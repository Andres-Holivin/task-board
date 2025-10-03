# Task Board - Full Stack Docker Deployment 🚀

Complete Docker setup for the entire Task Board application (Frontend + Backend + Database).

## 📋 Quick Start

### 1. Setup Environment

```powershell
# Copy environment file
cp .env.example .env

# Edit with your credentials
notepad .env
```

Required values in `.env`:
- `DB_PASSWORD` - Strong PostgreSQL password
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Minimum 32 characters for JWT signing
- `GEMINI_API_KEY` - Google Gemini API key

### 2. Build and Start

```powershell
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec api npx prisma migrate deploy

# Check status
docker-compose ps
```

### 3. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Database:** localhost:5432

### 4. Verify Deployment

```powershell
# Check health endpoints
curl http://localhost:3001/health  # Backend
curl http://localhost:3000/api/health  # Frontend

# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f client
docker-compose logs -f api
docker-compose logs -f postgres
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│         Docker Network (task-board)          │
│                                              │
│  ┌─────────────┐      ┌──────────────┐     │
│  │   Client    │      │     API      │     │
│  │  (Next.js)  │─────►│   (NestJS)   │     │
│  │  Port: 3000 │      │  Port: 3001  │     │
│  └─────────────┘      └───────┬──────┘     │
│                                │            │
│                                ▼            │
│                       ┌──────────────┐     │
│                       │  PostgreSQL  │     │
│                       │  Port: 5432  │     │
│                       └──────────────┘     │
│                                              │
└──────────────────────────────────────────────┘
```

## 📦 Services

### 1. PostgreSQL Database
- **Image:** postgres:16-alpine
- **Port:** 5432
- **Volume:** Persistent data storage
- **Health Check:** Automatic readiness check

### 2. NestJS API
- **Build:** Multi-stage production build
- **Port:** 3001
- **Features:**
  - JWT Authentication
  - Task CRUD operations
  - AI suggestions (Gemini)
  - Request timeout handling
  - Prisma ORM

### 3. Next.js Client
- **Build:** Standalone production build
- **Port:** 3000
- **Features:**
  - Kanban board UI
  - Drag-and-drop
  - Authentication
  - Real-time updates
  - AI integration

## 🛠️ Common Commands

### Service Management

```powershell
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart client

# View status
docker-compose ps

# View resource usage
docker stats
```

### Logs

```powershell
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f client
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 api

# Since timestamp
docker-compose logs --since 2024-10-03T10:00:00
```

### Database Operations

```powershell
# Run migrations
docker-compose exec api npx prisma migrate deploy

# Create migration
docker-compose exec api npx prisma migrate dev --name migration_name

# Prisma Studio (Database GUI)
docker-compose exec api npx prisma studio

# Connect to database
docker-compose exec postgres psql -U postgres -d taskboard

# Backup database
docker-compose exec postgres pg_dump -U postgres taskboard > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres taskboard < backup.sql
```

### Container Shell Access

```powershell
# Access API container
docker-compose exec api sh

# Access client container
docker-compose exec client sh

# Access database container
docker-compose exec postgres sh
```

### Build and Rebuild

```powershell
# Rebuild all services
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Rebuild specific service
docker-compose build api
docker-compose build client

# Pull latest images
docker-compose pull
```

### Cleanup

```powershell
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes data)
docker-compose down -v

# Remove unused images
docker image prune -f

# Complete cleanup
docker-compose down -v
docker system prune -af --volumes
```

## 🔧 Development Mode

For development with hot reload:

```powershell
# Start backend in dev mode
cd server
docker-compose -f docker-compose.dev.yml up

# Start frontend in dev mode (new terminal)
cd client
docker-compose -f docker-compose.dev.yml up
```

## 🚨 Troubleshooting

### Services Not Starting

```powershell
# Check logs for errors
docker-compose logs

# Check specific service
docker-compose logs api

# Verify environment variables
docker-compose config
```

### Database Connection Issues

```powershell
# Check database is running
docker-compose ps postgres

# Test database connection
docker-compose exec postgres pg_isready -U postgres

# View database logs
docker-compose logs postgres
```

### Port Conflicts

```powershell
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Change ports in docker-compose.yml
ports:
  - "3002:3000"  # Frontend
  - "3003:3001"  # Backend
```

### Frontend Can't Connect to Backend

```powershell
# Check backend health
curl http://localhost:3001/health

# Check network
docker network ls
docker network inspect task-board-network

# Check CORS configuration in backend
docker-compose exec api cat src/main.ts
```

### Database Migration Errors

```powershell
# Reset database (⚠️ deletes data)
docker-compose exec api npx prisma migrate reset

# Force deploy migrations
docker-compose exec api npx prisma migrate deploy --skip-generate

# Generate Prisma Client
docker-compose exec api npx prisma generate
```

### Container Health Check Failing

```powershell
# Check health status
docker inspect --format='{{json .State.Health}}' task-board-api

# Manual health check
curl http://localhost:3001/health
curl http://localhost:3000/api/health

# View health check logs
docker-compose logs api | findstr health
```

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` file
- ✅ Use strong passwords (16+ characters)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/prod

### Database
- ✅ Don't expose PostgreSQL port in production
- ✅ Use strong database password
- ✅ Regular backups
- ✅ Enable SSL in production

### Application
- ✅ Keep dependencies updated
- ✅ Use non-root users in containers
- ✅ Limit container resources
- ✅ Enable HTTPS in production

### Docker
- ✅ Scan images for vulnerabilities
- ✅ Use specific image versions
- ✅ Minimize image layers
- ✅ Don't run as root

## 📊 Monitoring

### Health Checks

```powershell
# Check all services health
docker-compose ps

# API health
curl http://localhost:3001/health

# Client health
curl http://localhost:3000/api/health

# Database health
docker-compose exec postgres pg_isready
```

### Resource Usage

```powershell
# Real-time stats
docker stats

# Specific container
docker stats task-board-api

# Disk usage
docker system df
```

### Logs Analysis

```powershell
# Search for errors
docker-compose logs | findstr ERROR
docker-compose logs | findstr WARN

# Count log entries
docker-compose logs api | measure-object -line

# Export logs
docker-compose logs > logs.txt
```

## 🚀 Production Deployment

### Prerequisites
1. Domain name configured
2. SSL certificates obtained
3. Firewall configured
4. Backup strategy in place

### Steps

1. **Update Environment**
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

2. **Add Reverse Proxy (Nginx)**
   - Handle SSL termination
   - Rate limiting
   - Caching

3. **Configure CORS**
   ```typescript
   app.enableCors({
     origin: 'https://yourdomain.com',
     credentials: true,
   });
   ```

4. **Setup Monitoring**
   - Prometheus + Grafana
   - Log aggregation (ELK)
   - Uptime monitoring

5. **Enable Backups**
   ```powershell
   # Automated daily backup
   docker-compose exec postgres pg_dump -U postgres taskboard > backup_$(date +%Y%m%d).sql
   ```

## ✅ Success Checklist

- [ ] All services running: `docker-compose ps`
- [ ] Health checks passing
- [ ] Database migrations applied
- [ ] Frontend accessible: http://localhost:3000
- [ ] Backend accessible: http://localhost:3001
- [ ] Can register user
- [ ] Can login
- [ ] Can create tasks
- [ ] Kanban drag-and-drop works
- [ ] AI suggestions work
- [ ] Logs show no errors

## 📚 Additional Resources

- [Server Docker Guide](./server/DOCKER_DEPLOYMENT.md)
- [Client Docker Guide](./client/DOCKER_README.md)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🎯 Next Steps

1. **Test Full Application**
   - Register a new user
   - Create tasks
   - Test drag-and-drop
   - Try AI suggestions

2. **Optimize Performance**
   - Enable Redis caching
   - Configure CDN
   - Optimize database queries

3. **Setup CI/CD**
   - GitHub Actions
   - Automated testing
   - Automated deployment

4. **Production Deploy**
   - Choose hosting provider
   - Setup domain and SSL
   - Configure monitoring
   - Deploy and test

---

**Status:** Ready for Deployment ✅  
**Frontend:** http://localhost:3000  
**Backend:** http://localhost:3001  
**Database:** localhost:5432
