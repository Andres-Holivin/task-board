# 🤖 Gemini AI Integration Setup Guide

## Overview

The task board uses Google's Gemini AI to generate smart task suggestions. This guide will help you set up the API key and troubleshoot common issues.

## 🔑 Getting Your Gemini API Key

### Step 1: Visit Google AI Studio

Go to [Google AI Studio](https://aistudio.google.com/app/apikey)

### Step 2: Sign in with Google Account

- Use your Google account to sign in
- Accept the terms of service if prompted

### Step 3: Create API Key

1. Click **"Create API Key"** button
2. Choose **"Create API key in new project"** or select an existing project
3. Copy the generated API key (starts with `AIza...`)

### Step 4: Add to Environment Variables

Open `server/.env` and add:

```env
GEMINI_API_KEY=AIzaSy...your-actual-api-key-here
```

### Step 5: Restart Server

```bash
cd server
npm run start:dev
```

## 📊 Quota Information

### Free Tier Limits (As of 2025)

| Model | Free Quota | Rate Limit |
|-------|------------|------------|
| gemini-pro | 60 requests/min | Generous free tier |
| gemini-1.5-pro | 2 requests/min | 32,000 tokens/min |

**Note:** The application uses `gemini-pro` which is the most stable and widely available model with good free quota.

### Usage Tips

- Free tier resets every minute
- Each task suggestion request counts as 1 API call
- Average task suggestion uses ~200-500 tokens

### Checking Your Quota

Visit: [Google AI Studio Usage](https://aistudio.google.com/app/prompts)

## 🚨 Troubleshooting

### Error: "You exceeded your current quota"

**Cause:** You've hit the free tier limit or need to enable billing

**Solutions:**

1. **Wait for quota reset** (quotas reset every minute on free tier)

2. **Enable billing in Google Cloud:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to "Billing" → "Link a billing account"
   - Add payment method

3. **Use fallback suggestions:**
   - The app automatically provides fallback suggestions when API fails
   - Fallback suggestions are context-aware based on keywords

### Error: "API_KEY_INVALID"

**Cause:** Invalid or missing API key

**Solutions:**

1. Verify the API key in `server/.env`
2. Ensure no extra spaces or quotes around the key
3. Generate a new key from Google AI Studio

### Error: "model not found"

**Cause:** The specified model isn't available

**Solution:** The code now uses `gemini-1.5-flash` which is stable and widely available.

### Fallback Mode

When AI service fails, the app automatically returns fallback suggestions:

**Generic Context:**
- Review project documentation
- Code review pending PRs
- Fix critical bugs
- Write unit tests
- Optimize performance

**Web Development Context:** (when "web", "frontend", "react", "next" detected)
- Setup project structure
- Design UI components
- Implement routing
- Add form validation
- Optimize performance

**Backend Context:** (when "backend", "api", "server", "nest" detected)
- Design API endpoints
- Implement authentication
- Setup database models
- Add input validation
- Write API documentation

**Database Context:** (when "database", "sql", "prisma" detected)
- Design database schema
- Add database migrations
- Create seed data
- Optimize queries
- Setup backups

## 🔧 Configuration

### Current Model Settings

```typescript
// server/src/tasks/ai.service.ts
const model = this.genAI.getGenerativeModel({ 
  model: 'gemini-pro'  // Stable, reliable, widely available
});
```

### Changing the Model

If you want to use a different model:

```typescript
// Available options:
// - 'gemini-pro' - Most stable, best compatibility (RECOMMENDED)
// - 'gemini-1.5-pro' - More capable, but slower and lower quota
// - 'gemini-1.5-flash' - May not be available on all API versions

// Note: Some models like gemini-1.5-flash and gemini-2.5-flash 
// may not be available on the v1beta API that this library uses.
// Stick with 'gemini-pro' for best compatibility.
```

## 💡 Best Practices

### 1. API Key Security

✅ **DO:**
- Store API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables in production

❌ **DON'T:**
- Commit API keys to version control
- Share API keys publicly
- Hardcode keys in source code

### 2. Rate Limiting

To avoid hitting quota limits:

```typescript
// Add debouncing in frontend
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerate = async () => {
  if (isGenerating) return;  // Prevent multiple rapid calls
  setIsGenerating(true);
  
  try {
    await generateSuggestions();
  } finally {
    setIsGenerating(false);
  }
};
```

### 3. Error Handling

The service already includes comprehensive error handling:

- ✅ API key validation
- ✅ Quota exceeded detection
- ✅ Context-aware fallbacks
- ✅ Detailed console logging
- ✅ Graceful degradation

## 🧪 Testing

### Test AI Suggestions API

```bash
# With authentication token
curl http://localhost:3001/tasks/suggestions?context=building%20a%20web%20app \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (Success):**
```json
[
  {
    "title": "Setup project structure",
    "description": "Create folder structure and configure build tools"
  },
  {
    "title": "Design UI components",
    "description": "Create reusable component library with proper styling"
  },
  ...
]
```

**Expected Response (Quota Exceeded):**
```json
[
  {
    "title": "Review project documentation",
    "description": "Check and update project README and API documentation"
  },
  ...
]
```

### Test from Frontend

1. Login to the dashboard
2. Click "AI Suggestions" button
3. Enter context (optional): "building a Next.js app"
4. Click "Generate Suggestions"
5. Select and add suggested tasks

## 📈 Monitoring Usage

### Server Logs

Check server console for AI service logs:

```bash
# Success
✓ Generated 5 AI task suggestions

# Quota exceeded
⚠️  Gemini API quota exceeded or billing issue. Please check your Google AI Studio account.
   Visit: https://aistudio.google.com/app/apikey

# Invalid API key
⚠️  Invalid Gemini API key. Please check your GEMINI_API_KEY in .env

# Fallback mode
⚠️  Gemini model not available. Using fallback suggestions.
```

### Frontend Behavior

- ✅ Loading spinner while generating
- ✅ Toast notification on success
- ✅ Error toast if generation fails
- ✅ Fallback suggestions still displayed
- ✅ No UI crash on API failure

## 🔄 Alternative Options

If you prefer not to use Gemini AI:

### 1. Disable AI Features

Comment out the AI button in `client/src/app/dashboard/page.tsx`:

```tsx
// <Button 
//   onClick={() => setAiDialogOpen(true)}
//   variant="outline"
//   className="gap-2"
// >
//   <Sparkles className="h-4 w-4" />
//   AI Suggestions
// </Button>
```

### 2. Use OpenAI Instead

Replace Gemini with OpenAI:

```bash
npm install openai
```

```typescript
// server/src/tasks/ai.service.ts
import OpenAI from 'openai';

private readonly openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async generateTaskSuggestions(context?: string) {
  const completion = await this.openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  // Parse response...
}
```

### 3. Use Local AI Model

For completely free solution, use Ollama:

```bash
# Install Ollama
# Visit: https://ollama.ai

# Pull a model
ollama pull llama2

# Use in your service
```

## 📞 Support

### Google AI Studio Support
- Documentation: https://ai.google.dev/docs
- Issue Tracker: https://github.com/google/generative-ai-js/issues

### Application Issues
- Check server logs for detailed error messages
- Verify `.env` configuration
- Ensure database is connected
- Test with fallback suggestions first

## ✅ Quick Checklist

Before asking for support:

- [ ] API key is set in `server/.env`
- [ ] API key is valid (test at Google AI Studio)
- [ ] Server is running (`npm run start:dev`)
- [ ] No firewall blocking Google APIs
- [ ] Quota not exceeded (wait 1 minute or enable billing)
- [ ] Using `gemini-1.5-flash` model
- [ ] Browser console shows no CORS errors
- [ ] JWT authentication is working

## 🎉 Success!

Once configured, you should be able to:

1. Click "AI Suggestions" button
2. Enter optional context
3. Get 5 relevant task suggestions
4. Select multiple suggestions
5. Add them to your board instantly

The AI will understand your context and provide smart, actionable task suggestions! 🚀

---

**Last Updated:** October 2, 2025  
**Gemini Model:** gemini-pro  
**Status:** Production Ready ✅
