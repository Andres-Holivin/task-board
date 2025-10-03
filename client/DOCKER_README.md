# Next.js Client - Docker Quick Start 🚀

## 📦 Files Created

1. **`Dockerfile`** - Multi-stage production build
2. **`Dockerfile.dev`** - Development with hot reload
3. **`docker-compose.yml`** - Production deployment
4. **`docker-compose.dev.yml`** - Development environment
5. **`.dockerignore`** - Optimize build context
6. **`.env.docker.example`** - Environment template
7. **`src/app/api/health/route.ts`** - Health check endpoint
8. **`next.config.ts`** - Updated with standalone output

## 🚀 Quick Start

### Production

```powershell
# 1. Copy environment file
cd client
cp .env.docker.example .env.docker

# 2. Build and run
docker-compose build
docker-compose up -d

# 3. Access the app
# Open http://localhost:3000
```

### Development

```powershell
# Start with hot reload
docker-compose -f docker-compose.dev.yml up

# Your changes in src/ will auto-reload
```

## 🔗 Connect to Backend

The frontend is configured to connect to the backend API at `http://localhost:3001` by default.

### If backend is also in Docker:

Update `docker-compose.yml` to use the same network:

```yaml
services:
  nextjs:
    # ... existing config
    environment:
      - NEXT_PUBLIC_API_URL=http://task-board-api:3001
    networks:
      - task-board-network

networks:
  task-board-network:
    external: true  # Use the network from server docker-compose
```

## 📊 Container Size

```
Production Image: ~200MB
├─ Base: ~40MB
├─ Dependencies: ~120MB
├─ Built app: ~40MB

Development Image: ~350MB
├─ Base: ~40MB
├─ All dependencies: ~250MB
├─ Source code: ~60MB
```

## 🔐 Environment Variables

```env
# .env.docker
NEXT_PUBLIC_API_URL=http://localhost:3001

# For production with custom backend
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🛠️ Common Commands

```powershell
# Production
docker-compose up -d              # Start in background
docker-compose logs -f            # View logs
docker-compose down               # Stop containers
docker-compose restart            # Restart

# Development
docker-compose -f docker-compose.dev.yml up     # Start
docker-compose -f docker-compose.dev.yml down   # Stop

# Build
docker-compose build --no-cache   # Rebuild from scratch

# Cleanup
docker-compose down -v            # Remove volumes too
```

## 🏗️ Architecture

### Multi-Stage Production Build

```
Stage 1: deps
  └─ Install production dependencies only

Stage 2: builder
  └─ Copy deps + source code
  └─ Build Next.js app (npm run build)
  └─ Generate standalone output

Stage 3: runner
  └─ Copy only built files
  └─ Run as non-root user (nextjs:nodejs)
  └─ Start Node.js server
```

### Development Build

```
Single Stage:
  └─ Install all dependencies
  └─ Mount source code as volume
  └─ Run dev server with hot reload
```

## 🔍 Health Check

The container includes a health check endpoint:

```bash
# Check health
curl http://localhost:3000/api/health

# Response
{
  "status": "ok",
  "timestamp": "2024-10-03T10:00:00.000Z",
  "service": "task-board-client"
}
```

## 🚨 Troubleshooting

### Port 3000 Already in Use

```powershell
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

### Can't Connect to Backend

```powershell
# Check backend is running
curl http://localhost:3001/health

# Verify environment variable
docker-compose exec nextjs printenv | findstr API_URL
```

### Build Fails

```powershell
# Clear cache and rebuild
docker-compose build --no-cache

# Check logs
docker-compose logs nextjs
```

### Hot Reload Not Working (Dev)

```powershell
# Ensure volumes are mounted correctly
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

## 🌐 Full Stack Deployment

To run both frontend and backend together:

```powershell
# In server folder
cd server
docker-compose up -d

# In client folder
cd ../client
docker-compose up -d
```

Or create a root `docker-compose.yml` to orchestrate both:

```yaml
version: '3.8'

services:
  # Backend from server/docker-compose.yml
  postgres:
    # ... config from server

  api:
    # ... config from server

  # Frontend
  client:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on:
      - api
    networks:
      - task-board-network

networks:
  task-board-network:
    driver: bridge
```

## ✅ Success Checklist

- [ ] Health endpoint responds: `http://localhost:3000/api/health`
- [ ] Can access UI: `http://localhost:3000`
- [ ] Can connect to backend: Check Network tab in browser
- [ ] Authentication works (login/register)
- [ ] Tasks CRUD operations work
- [ ] Kanban drag-and-drop works
- [ ] AI suggestions work

## 📝 Next Steps

1. **Configure Backend Connection**
   - Update `NEXT_PUBLIC_API_URL` in `.env.docker`
   - Ensure CORS is configured on backend

2. **Test Full Stack**
   - Start backend first
   - Then start frontend
   - Test all features

3. **Production Deployment**
   - Use a reverse proxy (Nginx/Traefik)
   - Setup SSL/TLS certificates
   - Configure domain names
   - Enable HTTPS only

## 🎯 Features

✅ Multi-stage production build (optimized)  
✅ Development mode with hot reload  
✅ Non-root user execution (security)  
✅ Health checks for monitoring  
✅ Volume mounting for development  
✅ Environment-based configuration  
✅ Standalone output (no Node.js overhead)  
✅ Small image size (~200MB)  

---

**Status:** Ready to Deploy ✅  
**Port:** 3000  
**Health Check:** http://localhost:3000/api/health
