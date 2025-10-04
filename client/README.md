# Task Board - Client

A modern, responsive task management application built with Next.js 15, featuring real-time updates, drag-and-drop functionality, and AI-powered task suggestions.

## 🚀 Features

- **Authentication System**: Secure login and registration with JWT tokens
- **Task Management**: Create, update, delete, and organize tasks
- **Drag & Drop**: Intuitive task organization with @dnd-kit
- **AI Suggestions**: Get intelligent task suggestions powered by AI
- **Real-time Updates**: Instant synchronization across the application
- **Dark/Light Theme**: Built-in theme switcher for user preference
- **Responsive Design**: Fully responsive UI that works on all devices
- **Form Validation**: Robust form validation with Zod and React Hook Form

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with Turbopack
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Date Handling**: date-fns & Moment.js

## � Prerequisites

- Node.js 18+ 
- Yarn package manager
- Running backend server (see [server README](../server/README.md))

## 🔧 Installation

1. **Install dependencies**:
```bash
yarn install
```

2. **Configure environment variables**:
Create a `.env.local` file in the client directory:

### Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# API Request Timeout (in milliseconds, optional - defaults to 30000)
NEXT_PUBLIC_API_TIMEOUT=30000

# App Configuration (optional)
PORT=3000
NODE_ENV=development
```

### API Request Timeout (in milliseconds)
```env
NEXT_PUBLIC_API_TIMEOUT=30000
```

### App Configuration
```
PORT=3000
NODE_ENV=development
```

3. **Run the development server**:
```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with Turbopack |
| `yarn build` | Build production application |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint for code quality |

## 📁 Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── dashboard/         # Dashboard page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── navbar/            # Navigation components
│   │   ├── providers/         # Context providers
│   │   ├── tasks/             # Task-related components
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── services/              # API service layer
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── package.json              # Dependencies and scripts
```

## 🎨 Key Components

### Authentication
- `LoginForm`: User login with email/password
- `RegisterForm`: New user registration
- `AuthProvider`: Authentication context provider

### Task Management
- `AddTaskDialog`: Create new tasks
- `EditTaskDialog`: Edit existing tasks
- `ViewTaskDialog`: View task details
- `DeleteTaskAlert`: Confirm task deletion
- `AiSuggestionsDialog`: Get AI-powered task suggestions

### Navigation
- `Navbar`: Main navigation bar
- `NavMenu`: Navigation menu items
- `Logo`: Application logo component

## 🔐 Authentication Flow

[![](https://mermaid.ink/img/pako:eNptkU1PAjEQhv_KZE4aUXQFWXvwwGpMvGhcVhOyl7odoIFt19nWiIT_bgsoJthTZ56-73x0hZVVhAJbevdkKrrVcsqyLg2E00h2utKNNA4KkC0ULfEhyiLKFpqMO4R5hDnxx3_KfLihvpFvsqXSbF8Upzc3mYA744ihYlLBWMtFu6XZlr7IhVbSEUws13A0tup4z3MBT4_5CLqy0V3p3ay7sFO9s8_jg2FwINaT5WGBfLh1iMNCFEdahVLqj17APRni2MDD62gPQmfP5DwbcHZOBk7A_-5s13nuLBNoA5W1c017VkSt0kyVC2pQsp29WckKOzhlrVA49tTBmriWMcRV1JYYOqypRBGuSvK8xNKsgyZseGxt_SNj66czFJMwZ4h8E5e3--3fLJNRxJn1xqFI-hsPFCv8RHHZvzi76l-lyUV6mSTJedrBJYpeepYOeteDXswngzRdd_BrU_Q8gP76G-hbv2w?type=png)](https://mermaid.live/edit#pako:eNptkU1PAjEQhv_KZE4aUXQFWXvwwGpMvGhcVhOyl7odoIFt19nWiIT_bgsoJthTZ56-73x0hZVVhAJbevdkKrrVcsqyLg2E00h2utKNNA4KkC0ULfEhyiLKFpqMO4R5hDnxx3_KfLihvpFvsqXSbF8Upzc3mYA744ihYlLBWMtFu6XZlr7IhVbSEUws13A0tup4z3MBT4_5CLqy0V3p3ay7sFO9s8_jg2FwINaT5WGBfLh1iMNCFEdahVLqj17APRni2MDD62gPQmfP5DwbcHZOBk7A_-5s13nuLBNoA5W1c017VkSt0kyVC2pQsp29WckKOzhlrVA49tTBmriWMcRV1JYYOqypRBGuSvK8xNKsgyZseGxt_SNj66czFJMwZ4h8E5e3--3fLJNRxJn1xqFI-hsPFCv8RHHZvzi76l-lyUV6mSTJedrBJYpeepYOeteDXswngzRdd_BrU_Q8gP76G-hbv2w)

The application uses JWT-based authentication:

1. User registers or logs in
2. Server returns JWT token
3. Token is stored in cookies
4. Token is included in subsequent API requests
5. Protected routes redirect to login if unauthenticated

## 🎯 Usage

### Creating a Task
1. Navigate to the dashboard
2. Click "Add Task" button
3. Fill in task details (title, description, status)
4. Submit the form

### Managing Tasks
- **Edit**: Click on a task to view and edit details
- **Delete**: Click the delete icon and confirm
- **Change Status**: Drag and drop tasks between columns (TODO, IN_PROGRESS, DONE)

### AI Suggestions
1. Click "Get AI Suggestions" button
2. Optionally provide context
3. Review AI-generated task suggestions
4. Add desired suggestions to your task list

## 🌐 API Integration

The client communicates with the backend server through REST API endpoints:

```
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
GET    /api/tasks              # Fetch all tasks
POST   /api/tasks              # Create a new task
GET    /api/tasks/:id          # Get single task
PATCH  /api/tasks/:id          # Update a task
DELETE /api/tasks/:id          # Delete a task
GET    /api/tasks/suggestions  # Get AI task suggestions
```

## 🎨 Theming

The application supports dark and light themes using `next-themes`. Users can toggle between themes using the theme switcher in the navigation bar.

## 🐳 Docker Support

Build and run using Docker:

```bash
# Build the image
docker build -t task-board-client .

# Run the container
docker run -p 3000:3000 task-board-client
```

Or use Docker Compose:

```bash
docker-compose up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## � License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Kill process on port 3000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Build errors**:
```bash
# Clear Next.js cache
Remove-Item -Recurse -Force .next
yarn dev
```

**Dependencies issues**:
```bash
# Clean install
Remove-Item -Recurse -Force node_modules, yarn.lock
yarn install
```

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

## � Related Documentation

- [Main Project README](../README.md)
- [Server README](../server/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com/)

---

**Built with ❤️ using Next.js 15 and React 19**


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
yarn build
yarn start
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
