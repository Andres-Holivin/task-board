# Request Timeout & Abort Implementation Guide

## Overview

The application includes comprehensive timeout and request abortion handling on both backend (NestJS) and frontend (React/Axios).

## 🔧 Backend Implementation (NestJS)

### Timeout Configuration

**Environment Variable:**
```env
# server/.env
REQUEST_TIMEOUT=30000  # 30 seconds in milliseconds
```

### Global Timeout Interceptor

Location: `server/src/config/handler.ts`

```typescript
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    private readonly requestTimeout: number;

    constructor(private readonly configService: ConfigService<Env, true>) {
        this.requestTimeout = this.configService.get<number>('REQUEST_TIMEOUT');
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout({
                each: this.requestTimeout,
                with: () => throwError(() => new GatewayTimeoutException(
                    `Request timeout after ${this.requestTimeout}ms`
                ))
            }),
            catchError((error) => {
                if (error instanceof TimeoutError) {
                    return throwError(() => new GatewayTimeoutException(
                        `Request processing exceeded ${this.requestTimeout}ms timeout`
                    ));
                }
                return throwError(() => error);
            })
        );
    }
}
```

### Registration in main.ts

```typescript
app.useGlobalInterceptors(
    new RequestHandler(),
    new TimeoutInterceptor(configService), // Handles request timeouts
    new ResponseHandler()
);
```

### Features

✅ **Automatic timeout handling** - All requests automatically timeout after configured duration
✅ **Detailed logging** - Logs request start, completion time, and timeout events
✅ **Graceful error responses** - Returns 504 Gateway Timeout with clear message
✅ **Request tracking** - Monitors request duration and logs slow requests

### Response on Timeout

```json
{
    "success": false,
    "statusCode": 504,
    "message": "Request timeout after 30000ms"
}
```

## 🌐 Frontend Implementation (React/Axios)

### Timeout Configuration

**Environment Variable:**
```env
# client/.env.local
NEXT_PUBLIC_API_TIMEOUT=30000  # 30 seconds in milliseconds
```

### API Client with Abort Support

Location: `client/src/services/api.ts`

**Features:**
- ✅ Automatic request abortion on timeout
- ✅ Manual request cancellation
- ✅ Track active requests
- ✅ Abort by pattern matching
- ✅ Cleanup on component unmount

### Key Methods

#### 1. Abort All Requests
```typescript
import { apiClient } from '@/services/api';

// Abort all active requests
apiClient.abortAllRequests('User navigated away');
```

#### 2. Abort Requests by Pattern
```typescript
// Abort all requests to /tasks endpoints
apiClient.abortRequestsByPattern('/tasks', 'Navigated to different page');

// Abort using regex
apiClient.abortRequestsByPattern(/\/tasks\/\d+/, 'Task page closed');
```

#### 3. Get Active Requests Count
```typescript
const count = apiClient.getActiveRequestsCount();
console.log(`Active requests: ${count}`);
```

### React Hooks for Abort Control

Location: `client/src/hooks/use-abort-controller.ts`

#### Single Request Hook

```typescript
import { useAbortController } from '@/hooks/use-abort-controller';

function MyComponent() {
    const { createAbortController, abort, getSignal } = useAbortController();

    const fetchData = async () => {
        const controller = createAbortController();
        
        try {
            const response = await fetch('/api/data', {
                signal: controller.signal
            });
            // Process response...
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request was cancelled');
            }
        }
    };

    const handleCancel = () => {
        abort('User cancelled request');
    };

    // Automatically aborts on unmount
    return (
        <div>
            <button onClick={fetchData}>Fetch Data</button>
            <button onClick={handleCancel}>Cancel</button>
        </div>
    );
}
```

#### Multiple Requests Hook

```typescript
import { useAbortControllers } from '@/hooks/use-abort-controller';

function TaskList() {
    const { createAbortController, abort, abortAll } = useAbortControllers();

    const fetchTask = async (taskId: string) => {
        const controller = createAbortController(`task-${taskId}`);
        
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                signal: controller.signal
            });
            // Process response...
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`Task ${taskId} request was cancelled`);
            }
        }
    };

    const cancelTask = (taskId: string) => {
        abort(`task-${taskId}`, 'User cancelled');
    };

    const cancelAllTasks = () => {
        abortAll('User clicked cancel all');
    };

    // Automatically aborts all on unmount
    return (
        <div>
            <button onClick={() => fetchTask('1')}>Fetch Task 1</button>
            <button onClick={() => cancelTask('1')}>Cancel Task 1</button>
            <button onClick={cancelAllTasks}>Cancel All</button>
        </div>
    );
}
```

## 📊 Use Cases

### 1. Long-Running Requests

**Problem:** AI task generation takes too long

**Solution:**
```typescript
// Backend - increase timeout for specific routes
@Injectable()
export class AiTimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout(60000), // 60 seconds for AI requests
            catchError(error => {
                if (error instanceof TimeoutError) {
                    return throwError(() => new GatewayTimeoutException(
                        'AI generation timeout - try with simpler context'
                    ));
                }
                return throwError(() => error);
            })
        );
    }
}

// Apply to specific controller
@UseInterceptors(AiTimeoutInterceptor)
@Controller('tasks')
export class TasksController { }
```

### 2. User Navigation Cancellation

**Problem:** User navigates away while requests are pending

**Solution:**
```typescript
'use client';
import { useEffect } from 'react';
import { apiClient } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function TaskPage() {
    const router = useRouter();

    useEffect(() => {
        // Cancel all requests when user navigates away
        return () => {
            apiClient.abortRequestsByPattern('/tasks', 'Navigation');
        };
    }, []);

    return <div>Task Page</div>;
}
```

### 3. Search Input Debouncing

**Problem:** Multiple search requests triggered rapidly

**Solution:**
```typescript
import { useAbortController } from '@/hooks/use-abort-controller';
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

function SearchBar() {
    const [results, setResults] = useState([]);
    const { createAbortController } = useAbortController();

    const search = useCallback(
        debounce(async (query: string) => {
            // Cancel previous search
            const controller = createAbortController();
            
            try {
                const response = await fetch(`/api/search?q=${query}`, {
                    signal: controller.signal
                });
                const data = await response.json();
                setResults(data);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Search failed:', error);
                }
            }
        }, 300),
        []
    );

    return (
        <input
            type="text"
            onChange={(e) => search(e.target.value)}
            placeholder="Search..."
        />
    );
}
```

### 4. Infinite Scroll with Cleanup

**Problem:** Old page requests still pending when loading new pages

**Solution:**
```typescript
import { useAbortControllers } from '@/hooks/use-abort-controller';
import { useEffect, useState } from 'react';

function InfiniteList() {
    const [page, setPage] = useState(1);
    const { createAbortController, abortAll } = useAbortControllers();

    const loadPage = async (pageNum: number) => {
        const controller = createAbortController(`page-${pageNum}`);
        
        try {
            const response = await fetch(`/api/items?page=${pageNum}`, {
                signal: controller.signal
            });
            // Process response...
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Failed to load page:', error);
            }
        }
    };

    useEffect(() => {
        loadPage(page);
    }, [page]);

    useEffect(() => {
        // Cleanup all pending requests on unmount
        return () => abortAll('Component unmounted');
    }, []);

    return <div>Infinite List</div>;
}
```

## 🔍 Debugging

### Backend Logging

The timeout interceptor logs detailed information:

```
[TimeoutInterceptor] Request timeout set to 30000ms
[TimeoutInterceptor] [GET] /api/tasks - Request started
[TimeoutInterceptor] [GET] /api/tasks - Completed in 1523ms
[TimeoutInterceptor] Request timeout after 30153ms: [POST] /api/tasks/suggestions
```

### Frontend Logging

Enable detailed logging:

```typescript
// In api.ts interceptor
console.log('Request aborted or timed out:', error.message);
console.log('Aborting active requests:', this.activeRequests.size);
console.log('Aborted request:', requestId);
```

### Check Active Requests

```typescript
// In browser console or React component
import { apiClient } from '@/services/api';

console.log('Active requests:', apiClient.getActiveRequestsCount());
```

## ⚙️ Configuration

### Adjust Timeouts

**Global timeout:**
```env
# Backend
REQUEST_TIMEOUT=45000  # 45 seconds

# Frontend
NEXT_PUBLIC_API_TIMEOUT=45000  # Match backend
```

**Per-request timeout (frontend):**
```typescript
const response = await apiClient.get('/api/slow-endpoint', {
    timeout: 60000  // 60 seconds for this specific request
});
```

### Disable Timeout for Specific Routes

```typescript
// Backend - create custom interceptor
@Injectable()
export class NoTimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle(); // No timeout applied
    }
}

// Apply to controller
@UseInterceptors(NoTimeoutInterceptor)
@Post('long-running-task')
async longTask() {
    // This route has no timeout
}
```

## 🧪 Testing

### Test Timeout Behavior

```typescript
// Backend test
describe('TimeoutInterceptor', () => {
    it('should timeout after configured duration', async () => {
        // Mock slow endpoint that takes > REQUEST_TIMEOUT
        const promise = request(app.getHttpServer())
            .get('/slow-endpoint')
            .expect(504);
            
        await expect(promise).resolves.toMatchObject({
            body: {
                statusCode: 504,
                message: expect.stringContaining('timeout')
            }
        });
    });
});

// Frontend test
test('should abort request on component unmount', () => {
    const { unmount } = render(<MyComponent />);
    
    // Trigger request
    fireEvent.click(screen.getByText('Fetch Data'));
    
    // Unmount component
    unmount();
    
    // Verify request was aborted
    expect(apiClient.getActiveRequestsCount()).toBe(0);
});
```

## 📋 Best Practices

### ✅ DO

- Set reasonable timeouts (30-60 seconds for most APIs)
- Always clean up abort controllers in useEffect cleanup
- Abort requests when component unmounts
- Cancel old requests when making new ones (search, pagination)
- Log timeout events for monitoring
- Provide user feedback when requests timeout

### ❌ DON'T

- Set timeout too short (< 5 seconds) for complex operations
- Forget to handle AbortError in catch blocks
- Leave requests running after navigation
- Ignore timeout errors (always handle gracefully)
- Use same timeout for all endpoints (customize as needed)

## 🚨 Error Handling

### Backend

```typescript
catch (error) {
    if (error instanceof GatewayTimeoutException) {
        return {
            success: false,
            message: 'Request took too long, please try again',
            statusCode: 504
        };
    }
}
```

### Frontend

```typescript
try {
    const data = await apiClient.get('/api/data');
} catch (error) {
    if (error.message.includes('timeout') || error.message.includes('cancelled')) {
        toast.error('Request timed out. Please try again.');
    } else if (error.message.includes('Network error')) {
        toast.error('Network connection lost. Check your internet.');
    } else {
        toast.error('An unexpected error occurred.');
    }
}
```

## 📈 Monitoring

Track timeout occurrences:

```typescript
// Backend - add metrics
@Injectable()
export class TimeoutMetricsInterceptor implements NestInterceptor {
    private timeoutCount = 0;
    
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout(30000),
            catchError(error => {
                if (error instanceof TimeoutError) {
                    this.timeoutCount++;
                    console.warn(`Total timeouts: ${this.timeoutCount}`);
                }
                return throwError(() => error);
            })
        );
    }
}
```

## 🎯 Summary

✅ **Backend:** Automatic 30s timeout on all requests via TimeoutInterceptor
✅ **Frontend:** Automatic request abortion with AbortController
✅ **Hooks:** React hooks for easy abort management
✅ **Logging:** Comprehensive logging for debugging
✅ **Cleanup:** Automatic cleanup on component unmount
✅ **Flexibility:** Per-request timeout configuration
✅ **Error Handling:** Graceful timeout and abort error handling

Your application now handles timeouts and request cancellation professionally! 🚀
