# Next.js Frontend with Authentication

This Next.js frontend application integrates with the NestJS backend authentication API using modern React patterns and best practices.

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety throughout the application
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible UI components
- **Zustand** - State management
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **js-cookie** - Cookie management for tokens

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── dashboard/         # Protected dashboard
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── protected-route.tsx
│   │   └── auth-error-alert.tsx
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom hooks and Zustand stores
│   └── use-auth.ts        # Authentication store and hooks
├── providers/             # React context providers
│   └── auth-provider.tsx  # Authentication provider
├── services/              # API service layer
│   ├── api.ts             # Axios configuration
│   ├── auth.ts            # Authentication API calls
│   └── index.ts
└── types/                 # TypeScript type definitions
    ├── auth.ts            # Authentication types
    └── index.ts
```

## 🔧 Setup Instructions

### 1. Install Dependencies

The following dependencies are already installed:

```bash
npm install axios react-hook-form @hookform/resolvers js-cookie zustand
npm install -D @types/js-cookie

# shadcn/ui components
npx shadcn@latest add button input label form alert
```

### 2. Environment Configuration

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`.

## 🏗️ Architecture & Best Practices

### State Management with Zustand

The authentication state is managed using Zustand with the following features:

- **Persistent state** - User data persists across browser sessions
- **Automatic token management** - JWT tokens stored in HTTP-only cookies
- **Error handling** - Centralized error state management
- **Loading states** - Loading indicators for better UX

```typescript
// Usage in components
const { user, isLoading, error } = useAuthStore();
const { login, logout, register } = useAuthActions();
```

### API Service Layer

The API layer uses Axios with the following features:

- **Automatic token injection** - JWT tokens added to requests
- **Token refresh** - Automatic token refresh on 401 responses
- **Error handling** - Centralized error processing
- **Type safety** - Full TypeScript support

```typescript
// Usage
import { authService } from '@/services';

const response = await authService.login(credentials);
```

### Form Handling

Forms use React Hook Form with Zod validation:

- **Type-safe validation** - Zod schemas ensure type safety
- **Real-time validation** - Immediate user feedback
- **Accessibility** - shadcn/ui components are fully accessible
- **Error display** - Clear error messages for users

### Protected Routes

Route protection is implemented with:

- **Global auth check** - AuthProvider initializes authentication state
- **Protected route wrapper** - ProtectedRoute component guards routes
- **Automatic redirects** - Unauthenticated users redirected to login
- **Public routes** - Some routes accessible without authentication

## 🔐 Authentication Flow

### 1. Registration/Login Process

1. User submits form data
2. Form validation using Zod schemas
3. API call through auth service
4. JWT tokens stored in HTTP-only cookies
5. User data stored in Zustand store
6. Automatic redirect to dashboard

### 2. Protected Route Access

1. AuthProvider checks token validity on app initialization
2. ProtectedRoute component wraps protected pages
3. Automatic redirect if not authenticated
4. Loading state while checking authentication

### 3. Automatic Token Refresh

1. Axios interceptor detects 401 responses
2. Automatic refresh token request
3. New tokens stored and request retried
4. Logout if refresh fails

### 4. Logout Process

1. API call to logout endpoint
2. Tokens removed from cookies
3. Zustand store reset
4. Redirect to home page

## 🎨 UI Components

The application uses shadcn/ui components for:

- **Consistent design** - Modern, accessible component library
- **Customizable styling** - Tailwind CSS for easy customization
- **Dark mode support** - Built-in theme switching
- **Responsive design** - Mobile-first approach

### Key Components

- `LoginForm` - Login form with validation
- `RegisterForm` - Registration form with password confirmation
- `ProtectedRoute` - Route protection wrapper
- `AuthErrorAlert` - Error display component
- `AuthProvider` - Authentication context provider

## 🛡️ Security Features

### Frontend Security

- **HTTP-only cookies** - Tokens stored securely
- **Automatic token refresh** - Seamless user experience
- **CSRF protection** - Cookie-based authentication
- **Input validation** - Client-side validation with Zod
- **Protected routes** - Unauthorized access prevention

### Best Practices Implemented

- **Type safety** - Full TypeScript coverage
- **Error boundaries** - Graceful error handling
- **Loading states** - Better user experience
- **Responsive design** - Mobile-friendly interface
- **Accessibility** - WCAG compliant components
- **SEO friendly** - Next.js SSR capabilities

## 🚀 Usage Examples

### Authentication Hook

```typescript
import { useAuthActions, useUser, useIsAuthenticated } from '@/hooks/use-auth';

function MyComponent() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const { login, logout, register } = useAuthActions();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // User automatically redirected to dashboard
    } catch (error) {
      // Error handled by store and displayed in UI
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.fullName}!</p>
      ) : (
        <button onClick={() => handleLogin(credentials)}>
          Login
        </button>
      )}
    </div>
  );
}
```

### Protected Page

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        {/* Your protected content */}
      </div>
    </ProtectedRoute>
  );
}
```

### API Service

```typescript
import { authService } from '@/services';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get user profile
const user = await authService.getProfile();

// Logout
await authService.logout();
```

## 🔄 Integration with Backend

The frontend integrates seamlessly with the NestJS backend:

1. **API Endpoints** - Calls match backend routes exactly
2. **Type Safety** - Shared type definitions ensure consistency
3. **Error Handling** - Backend error responses properly handled
4. **Authentication** - JWT tokens work with Supabase auth
5. **CORS** - Properly configured for cross-origin requests

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile-first approach** - Optimized for mobile devices
- **Breakpoint management** - Tailwind CSS responsive utilities
- **Touch-friendly** - Large touch targets and gestures
- **Progressive enhancement** - Works on all device sizes

## 🧪 Testing

The architecture supports easy testing with:

- **Component testing** - Isolated component testing
- **Hook testing** - Custom hooks can be tested separately
- **API mocking** - Service layer enables easy mocking
- **Integration testing** - End-to-end authentication flows

## 🚀 Deployment

For production deployment:

1. **Environment variables** - Set `NEXT_PUBLIC_API_URL` to production API
2. **Build optimization** - Next.js optimizes for production
3. **Security headers** - Configure security headers in next.config.js
4. **Performance** - Code splitting and lazy loading enabled

## 📋 Features Implemented

✅ **User Registration** with validation  
✅ **User Login** with error handling  
✅ **Protected Routes** with automatic redirects  
✅ **JWT Token Management** with automatic refresh  
✅ **Responsive Design** with mobile support  
✅ **Error Handling** with user-friendly messages  
✅ **Loading States** for better UX  
✅ **Type Safety** throughout the application  
✅ **Modern UI** with shadcn/ui components  
✅ **State Management** with Zustand  
✅ **Form Validation** with Zod schemas  

## 🎯 Next Steps

Potential enhancements:

- **Password reset** functionality
- **Email verification** flow
- **Remember me** option
- **Social login** integration
- **Two-factor authentication**
- **User profile management**
- **Theme switching**
- **Internationalization**

This implementation provides a solid foundation for a modern, secure, and scalable authentication system in your Next.js application.