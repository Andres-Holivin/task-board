# Docker Deployment Guide - Task Board API

This guide covers how to deploy the NestJS Task Board API using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB of free RAM
- Ports 3001 and 5432 available

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.docker.example .env.docker

# Edit the file with your actual values
# Linux/Mac:
nano .env.docker

# Windows:
notepad .env.docker
```

**Required variables to change:**
- `DB_PASSWORD` - Set a strong database password
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `JWT_SECRET` - A strong secret (min 32 characters)
- `GEMINI_API_KEY` - Your Google Gemini API key

### 2. Build and Start

```bash
# Build the Docker images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

### 3. Run Database Migrations

```bash
# Run Prisma migrations
docker-compose exec api npx prisma migrate deploy

# (Optional) Generate Prisma Client if needed
docker-compose exec api npx prisma generate
```

### 4. Verify Installation

```bash
# Check if containers are running
docker-compose ps

# Test the API
curl http://localhost:3001/health
```

## 🏗️ Architecture

### Services

1. **postgres** - PostgreSQL 16 database
   - Port: 5432
   - Volume: `postgres_data` (persistent)
   - Health checks enabled

2. **api** - NestJS application
   - Port: 3001
   - Depends on: postgres
   - Auto-restarts on failure

3. **redis** (optional) - Redis cache
   - Port: 6379
   - Profile: `with-redis`

### Network

All services run on the `task-board-network` bridge network.

## 📦 Docker Files

### Dockerfile (Production)

Multi-stage build:
1. **Builder stage** - Install deps, generate Prisma, build app
2. **Production stage** - Copy artifacts, run as non-root user

Features:
- ✅ Multi-stage build (smaller image)
- ✅ Non-root user (security)
- ✅ Health checks
- ✅ Dumb-init for signal handling
- ✅ Alpine base (smaller size)

### Dockerfile.dev (Development)

Single-stage build with hot reload:
- All dependencies installed
- Source code mounted as volume
- Debugger port exposed (9229)
- Instant code changes

## 🔧 Common Commands

### Production

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f api
docker-compose logs -f postgres

# Restart API only
docker-compose restart api

# Run Prisma migrations
docker-compose exec api npx prisma migrate deploy

# Access Prisma Studio
docker-compose exec api npx prisma studio

# Shell into API container
docker-compose exec api sh

# Shell into PostgreSQL
docker-compose exec postgres psql -U postgres -d taskboard

# Clean everything (including volumes)
docker-compose down -v
docker system prune -f
```

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Build development images
docker-compose -f docker-compose.dev.yml build

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# View dev logs
docker-compose -f docker-compose.dev.yml logs -f api
```

### With Redis (Optional)

```bash
# Start with Redis
docker-compose --profile with-redis up -d

# Access Redis CLI
docker-compose exec redis redis-cli

# Monitor Redis
docker-compose exec redis redis-cli MONITOR
```

## 🔍 Debugging

### Check Container Status

```bash
# List all containers
docker-compose ps

# Check container resource usage
docker stats

# Inspect container
docker inspect task-board-api
```

### View Logs

```bash
# Follow API logs
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api

# Logs since 1 hour ago
docker-compose logs --since 1h api

# All services logs
docker-compose logs -f
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose exec postgres pg_isready -U postgres

# Check database connection from API
docker-compose exec api npx prisma db pull

# View database logs
docker-compose logs postgres
```

### Health Checks

```bash
# Check API health endpoint
curl http://localhost:3001/health

# Check container health status
docker inspect --format='{{.State.Health.Status}}' task-board-api
```

## 🛡️ Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env.docker` to git
- ✅ Use strong passwords (min 20 characters)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/staging/prod

### 2. Database

- ✅ Strong password for PostgreSQL
- ✅ Don't expose port 5432 in production
- ✅ Regular backups
- ✅ Limit connections

### 3. Application

- ✅ Run as non-root user (already configured)
- ✅ Read-only file system where possible
- ✅ Resource limits (CPU/Memory)
- ✅ Network isolation

### 4. Docker Images

- ✅ Use specific versions (not `latest`)
- ✅ Scan for vulnerabilities
- ✅ Keep base images updated
- ✅ Minimize image size

## 📊 Monitoring

### Container Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Logging

```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🔄 Database Backup

### Manual Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres taskboard > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T postgres psql -U postgres taskboard < backup_20250102_120000.sql
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres taskboard | gzip > "${BACKUP_DIR}/backup_${DATE}.sql.gz"

# Keep only last 7 days
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +7 -delete
```

## 🚀 Production Deployment

### 1. Update docker-compose.yml

```yaml
services:
  api:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 2. Use Environment Files

```bash
# Production
docker-compose --env-file .env.production up -d

# Staging
docker-compose --env-file .env.staging up -d
```

### 3. HTTPS Setup

Use a reverse proxy (Nginx/Traefik):

```yaml
# Add to docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
```

### 4. Database in External Service

For production, consider using managed PostgreSQL:

```yaml
services:
  api:
    environment:
      # Point to external database
      DATABASE_URL: ${EXTERNAL_DATABASE_URL}
      
# Remove postgres service
```

## 🧪 Testing

### Run Tests in Container

```bash
# Unit tests
docker-compose exec api npm run test

# E2E tests
docker-compose exec api npm run test:e2e

# Test coverage
docker-compose exec api npm run test:cov
```

## 📈 Performance Optimization

### 1. Enable BuildKit

```bash
# Enable Docker BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build with cache
docker-compose build --parallel
```

### 2. Multi-stage Build Cache

```bash
# Build with cache from registry
docker-compose build --build-arg BUILDKIT_INLINE_CACHE=1
```

### 3. Volume Caching

For development, use cached volumes:

```yaml
volumes:
  - ./src:/app/src:cached
  - node_modules:/app/node_modules:delegated
```

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Or on Windows
netstat -ano | findstr :3001

# Kill the process or change port
PORT=3002 docker-compose up -d
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs api

# Check all logs with timestamps
docker-compose logs -t

# Inspect container
docker inspect task-board-api
```

### Database Connection Failed

```bash
# Verify postgres is healthy
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Try connecting manually
docker-compose exec postgres psql -U postgres -d taskboard
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase Docker memory limit in Docker Desktop
# Or add memory limits in docker-compose.yml
```

### Permission Denied

```bash
# Check file ownership
ls -la

# Fix permissions
sudo chown -R $(whoami):$(whoami) .

# Or run with appropriate user
docker-compose exec -u root api sh
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [NestJS Docker Deployment](https://docs.nestjs.com/recipes/docker)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deploy-with-docker)

## 🎯 Quick Reference

```bash
# Production
docker-compose up -d                    # Start
docker-compose down                     # Stop
docker-compose logs -f api              # Logs
docker-compose exec api npx prisma migrate deploy  # Migrate

# Development
docker-compose -f docker-compose.dev.yml up         # Start dev
docker-compose -f docker-compose.dev.yml logs -f    # Logs

# Maintenance
docker-compose restart api              # Restart API
docker-compose down -v                  # Clean all
docker system prune -f                  # Clean Docker
```

---

**Status:** Production Ready ✅  
**Last Updated:** October 3, 2025  
**Docker Version:** 24.0+  
**Docker Compose Version:** 2.0+
