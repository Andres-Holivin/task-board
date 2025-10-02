# Task API Authentication Guide

## 🔐 Authentication Overview

All Task API endpoints are protected with JWT authentication. Users must be logged in to access any task-related functionality.

## Implementation Summary

### ✅ What's Implemented

1. **JWT Guard on All Endpoints**
   - `@UseGuards(JwtAuthGuard)` at controller level
   - Validates JWT token on every request
   - Returns 401 if token is missing/invalid

2. **User Context Extraction**
   - `@CurrentUser()` decorator extracts user from JWT
   - Type-safe user object: `{ id, email, fullName }`
   - No manual token parsing needed

3. **Data Isolation**
   - Each query filters by `userId`
   - Users can only see/modify their own tasks
   - Ownership verified on all operations

4. **Input Validation**
   - Zod schemas for runtime validation
   - TypeScript for compile-time safety
   - Validation errors return 400 Bad Request

## Code Changes Made

### 1. Updated Tasks Controller

**Before:**
```typescript
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  @Post()
  create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }
}
```

**After:**
```typescript
@Controller('tasks')
@UseGuards(JwtAuthGuard)  // ✅ Protects all endpoints
export class TasksController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: User,  // ✅ Type-safe user extraction
    @Body(new ZodValidationPipe(createTaskSchema)) createTaskDto: CreateTaskDto,  // ✅ Validation
  ) {
    return this.tasksService.create(user.id, createTaskDto);
  }
}
```

### 2. Added Zod Validation Schemas

**create-task.dto.ts:**
```typescript
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
```

**update-task.dto.ts:**
```typescript
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
```

## API Endpoints

All endpoints require: `Authorization: Bearer <JWT_TOKEN>`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/tasks` | ✅ Required | Create new task |
| GET | `/tasks` | ✅ Required | Get all user's tasks |
| GET | `/tasks/suggestions` | ✅ Required | Get AI suggestions |
| GET | `/tasks/:id` | ✅ Required | Get specific task |
| PATCH | `/tasks/:id` | ✅ Required | Update task |
| DELETE | `/tasks/:id` | ✅ Required | Delete task |

## Request Examples

### 1. Create Task (Authenticated)

```bash
curl -X POST http://localhost:3001/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive docs",
    "status": "TODO"
  }'
```

**Response (201):**
```json
{
  "id": "uuid-here",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs",
  "status": "TODO",
  "userId": "user-uuid",
  "createdAt": "2025-10-02T10:00:00.000Z",
  "updatedAt": "2025-10-02T10:00:00.000Z"
}
```

### 2. Get All Tasks (Authenticated)

```bash
curl http://localhost:3001/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "title": "Task 1",
    "description": "Description 1",
    "status": "TODO",
    "userId": "user-uuid",
    "createdAt": "2025-10-02T10:00:00.000Z",
    "updatedAt": "2025-10-02T10:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "title": "Task 2",
    "description": "Description 2",
    "status": "IN_PROGRESS",
    "userId": "user-uuid",
    "createdAt": "2025-10-02T09:00:00.000Z",
    "updatedAt": "2025-10-02T09:30:00.000Z"
  }
]
```

### 3. Update Task (Authenticated)

```bash
curl -X PATCH http://localhost:3001/tasks/uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DONE"
  }'
```

### 4. Get AI Suggestions (Authenticated)

```bash
curl "http://localhost:3001/tasks/suggestions?context=Building%20a%20Next.js%20app" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
[
  {
    "title": "Set up project structure",
    "description": "Create folders and initial files"
  },
  {
    "title": "Configure routing",
    "description": "Set up Next.js app router"
  },
  ...
]
```

## Error Responses

### 401 Unauthorized (No/Invalid Token)
```bash
curl http://localhost:3001/tasks
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 400 Bad Request (Validation Error)
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'  # Empty title
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required"]
  }
}
```

### 403 Forbidden (Not Task Owner)
```bash
# Trying to access another user's task
curl http://localhost:3001/tasks/other-user-task-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "statusCode": 403,
  "message": "You do not have access to this task"
}
```

### 404 Not Found
```bash
curl http://localhost:3001/tasks/non-existent-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "statusCode": 404,
  "message": "Task with ID non-existent-id not found"
}
```

## Security Features

### 1. Authentication Required
- ✅ All endpoints require valid JWT token
- ✅ Token must be in `Authorization: Bearer <token>` header
- ✅ Invalid/expired tokens rejected with 401

### 2. Data Isolation
```typescript
// TasksService automatically filters by userId
async findAll(userId: string): Promise<Task[]> {
  return await this.prisma.task.findMany({
    where: { userId },  // ✅ Only user's tasks
    orderBy: { createdAt: 'desc' },
  });
}
```

### 3. Ownership Verification
```typescript
async findOne(id: string, userId: string): Promise<Task> {
  const task = await this.prisma.task.findUnique({ where: { id } });
  
  if (!task) throw new NotFoundException();
  
  if (task.userId !== userId) {  // ✅ Verify ownership
    throw new ForbiddenException('You do not have access to this task');
  }
  
  return task;
}
```

### 4. Input Validation
- ✅ Zod schema validation on all inputs
- ✅ Title: required, 1-100 characters
- ✅ Description: optional, max 500 characters
- ✅ Status: must be TODO, IN_PROGRESS, or DONE

## Testing Authentication

### Test Flow:

1. **Register/Login**
```bash
# Login
TOKEN=$(curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.accessToken')

echo $TOKEN
```

2. **Use Token for Tasks**
```bash
# Create task
curl -X POST http://localhost:3001/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","status":"TODO"}'

# Get all tasks
curl http://localhost:3001/tasks \
  -H "Authorization: Bearer $TOKEN"
```

3. **Test Without Token (Should Fail)**
```bash
curl http://localhost:3001/tasks
# Expected: 401 Unauthorized
```

## Frontend Integration

The frontend automatically handles authentication via Axios interceptor:

```typescript
// client/src/services/api.ts
this.client.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // ✅ Auto-added
  }
  return config;
});
```

**Frontend usage:**
```typescript
// No need to manually add token - interceptor does it
const tasks = await tasksApi.getAll();  // ✅ Token included
const newTask = await tasksApi.create({ title: 'New Task' });  // ✅ Token included
```

## Troubleshooting

### Issue: Getting 401 on all requests

**Solutions:**
1. Verify you're logged in: `GET /auth/profile`
2. Check token format: `Authorization: Bearer <token>`
3. Ensure token hasn't expired (7 days)
4. Try refreshing token: `POST /auth/refresh`

### Issue: Can't access my task

**Check:**
1. Task exists: `GET /tasks` to list all
2. Task ID is correct
3. You're the owner (can't access other users' tasks)

### Issue: Validation errors

**Common causes:**
- Empty title (required)
- Title too long (>100 chars)
- Description too long (>500 chars)
- Invalid status (must be TODO, IN_PROGRESS, or DONE)

## Summary

✅ **Authentication**: JWT required on all endpoints

✅ **Authorization**: Users can only access their own tasks

✅ **Validation**: All inputs validated with Zod schemas

✅ **Type Safety**: Full TypeScript + Zod integration

✅ **Security**: Multi-layer protection (auth + ownership + validation)

✅ **Error Handling**: Clear, actionable error messages

The Task API is production-ready with enterprise-grade security! 🔒

