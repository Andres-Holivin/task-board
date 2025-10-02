# Task Board - Pre-Launch Checklist

## ✅ Before Running the Application

### 1. Environment Variables

- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Fill in all required values in `server/.env`:
  - [ ] `DATABASE_URL` from Supabase
  - [ ] `SUPABASE_URL` from Supabase
  - [ ] `SUPABASE_ANON_KEY` from Supabase
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` from Supabase
  - [ ] `JWT_SECRET` (generate secure 32+ char string)
  - [ ] `GEMINI_API_KEY` from Google AI Studio

- [ ] Copy `client/.env.example` to `client/.env.local`
- [ ] Verify `NEXT_PUBLIC_API_URL=http://localhost:3001`

### 2. Database Setup

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

- [ ] Prisma client generated successfully
- [ ] Migration completed without errors
- [ ] Tasks table created in database

### 3. Dependencies

```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

- [ ] All server dependencies installed
- [ ] All client dependencies installed
- [ ] No dependency conflicts

### 4. Build Check (Optional)

```bash
# Server
cd server
npm run build

# Client
cd client
npm run build
```

- [ ] Server builds without errors
- [ ] Client builds without errors

## 🚀 Running the Application

### Start Backend (Terminal 1)

```bash
cd server
npm run start:dev
```

**Verify:**
- [ ] Server starts on port 3001
- [ ] No error messages
- [ ] Console shows "🚀 Server running on http://localhost:3001"

### Start Frontend (Terminal 2)

```bash
cd client
npm run dev
```

**Verify:**
- [ ] Client starts on port 3000
- [ ] Opens browser automatically
- [ ] No compilation errors

## ✅ Testing Features

### 1. Authentication

- [ ] Navigate to http://localhost:3000
- [ ] Register a new account
- [ ] Login with credentials
- [ ] Redirects to dashboard

### 2. Task Management

**Create Task:**
- [ ] Click "Add Task" button
- [ ] Fill in title and description
- [ ] Select status
- [ ] Task appears in correct column

**Edit Task:**
- [ ] Click three-dot menu on a task
- [ ] Click "Edit"
- [ ] Change title/description/status
- [ ] Changes saved successfully

**Delete Task:**
- [ ] Click three-dot menu on a task
- [ ] Click "Delete"
- [ ] Confirm deletion
- [ ] Task removed from board

**Drag & Drop:**
- [ ] Drag task to different column
- [ ] Task status updates
- [ ] Success toast appears

### 3. AI Integration

**Generate Suggestions:**
- [ ] Click "AI Suggestions" button
- [ ] Leave context empty or add context
- [ ] Click "Generate Suggestions"
- [ ] 5 suggestions appear
- [ ] Can select multiple suggestions
- [ ] Click "Add Selected"
- [ ] Selected tasks added to board

**With Context:**
- [ ] Enter context like "Building a Next.js app"
- [ ] Generate suggestions
- [ ] Suggestions are relevant to context

### 4. UI/UX

- [ ] Kanban board displays correctly
- [ ] All three columns visible (Todo, In Progress, Done)
- [ ] Task counts show correctly
- [ ] Dark/Light mode toggle works
- [ ] Responsive on mobile
- [ ] All buttons functional
- [ ] Toast notifications appear
- [ ] Loading states show during operations

## 🐛 Common Issues & Solutions

### Backend won't start

**Issue**: Port 3001 already in use
```bash
npx kill-port 3001
```

**Issue**: Database connection error
- Check `DATABASE_URL` is correct
- Verify database is accessible
- Check Supabase project is active

**Issue**: Missing GEMINI_API_KEY
- Add key to `.env` file
- AI features will use fallback suggestions without key

### Frontend won't start

**Issue**: Port 3000 already in use
```bash
npx kill-port 3000
```

**Issue**: API connection failed
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

### Tasks not loading

**Issue**: 401 Unauthorized
- Login again
- Check JWT token is valid
- Verify auth cookies are set

**Issue**: Tasks not appearing
- Check browser console for errors
- Verify backend /tasks endpoint works
- Check database has tasks table

### AI Suggestions not working

**Issue**: Error generating suggestions
- Verify `GEMINI_API_KEY` is correct
- Check API quota limits
- Review backend logs
- Should fallback to default suggestions

### Drag & Drop not working

**Issue**: Tasks snap back to original column
- Check browser console for errors
- Verify network request completed
- Check backend logs for update errors

## 📊 Health Check Endpoints

Test these URLs to verify backend is working:

```bash
# Backend health
curl http://localhost:3001

# Tasks endpoint (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/tasks

# AI suggestions endpoint (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/tasks/suggestions
```

## 🎯 Success Criteria

Your application is working correctly if:

✅ **Authentication**
- Can register new users
- Can login and logout
- Protected routes redirect to login

✅ **Task Management**
- Can create tasks
- Can edit tasks
- Can delete tasks
- Can drag-and-drop tasks
- Status updates correctly

✅ **AI Integration**
- AI button opens dialog
- Can generate suggestions
- Can add selected suggestions
- Fallback works without API key

✅ **User Experience**
- No console errors
- Toast notifications work
- Loading states show
- UI is responsive

## 📝 Notes

- First-time setup takes ~5 minutes
- Gemini API is free with daily quota
- Supabase free tier is sufficient for development
- Database migrations are automatic in development

## 🎉 You're Ready!

If all checkboxes are checked, your Task Board is fully functional and ready to use!

For detailed documentation, see:
- `SETUP_GUIDE.md` - Complete setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Feature overview and architecture
