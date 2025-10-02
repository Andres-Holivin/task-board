import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Env } from '../config/env';

export interface TaskSuggestion {
    title: string;
    description: string;
}

@Injectable()
export class AiService {
    private readonly genAI: GoogleGenerativeAI;

    constructor(private readonly configService: ConfigService<Env, true>) {
        const apiKey = this.configService.get('GEMINI_API_KEY', { infer: true });
        this.genAI = new GoogleGenerativeAI(String(apiKey));
    }

    async generateTaskSuggestions(context?: string): Promise<TaskSuggestion[]> {
        // Check if API key is configured
        const apiKey = this.configService.get('GEMINI_API_KEY', { infer: true });
        if (!apiKey || apiKey === 'your-gemini-api-key-here') {
            console.warn('Gemini API key not configured. Returning fallback suggestions.');
            return this.getFallbackSuggestions(context);
        }

        try {
            // Use gemini-pro which is stable and widely available
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash'
            });

            const prompt = context
                ? `Generate 5 practical task suggestions based on this context: "${context}". Return the tasks in JSON format as an array of objects with "title" and "description" fields. Keep titles concise (5-8 words) and descriptions brief (1-2 sentences). Make the tasks actionable and specific.`
                : `Generate 5 practical task suggestions for a general task board. Return the tasks in JSON format as an array of objects with "title" and "description" fields. Keep titles concise (5-8 words) and descriptions brief (1-2 sentences). Make the tasks actionable and specific. Examples: project planning, code review, documentation, bug fixes, feature development.`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Extract JSON from markdown code blocks if present
            let jsonText = text;
            const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
            const jsonMatch = jsonRegex.exec(text);
            if (jsonMatch) {
                jsonText = jsonMatch[1];
            }

            const suggestions = JSON.parse(jsonText);

            // Validate the response structure
            if (!Array.isArray(suggestions)) {
                throw new Error('Invalid response format');
            }

            return suggestions.slice(0, 5).map((s: any) => ({
                title: s.title || '',
                description: s.description || '',
            }));
        } catch (error: any) {
            // Log detailed error information
            console.error('Error generating task suggestions:', error);

            // Check for specific error types
            if (error.message?.includes('quota') || error.message?.includes('billing')) {
                console.warn('⚠️  Gemini API quota exceeded or billing issue. Please check your Google AI Studio account.');
                console.warn('   Visit: https://aistudio.google.com/app/apikey');
            } else if (error.message?.includes('API_KEY_INVALID')) {
                console.warn('⚠️  Invalid Gemini API key. Please check your GEMINI_API_KEY in .env');
            } else if (error.message?.includes('model not found')) {
                console.warn('⚠️  Gemini model not available. Using fallback suggestions.');
            }

            // Return context-aware fallback suggestions
            return this.getFallbackSuggestions(context);
        }
    }

    private getFallbackSuggestions(context?: string): TaskSuggestion[] {
        // If context is provided, try to generate context-aware suggestions
        if (context) {
            const lowercaseContext = context.toLowerCase();

            // Web development context
            if (lowercaseContext.includes('web') || lowercaseContext.includes('frontend') || lowercaseContext.includes('react') || lowercaseContext.includes('next')) {
                return [
                    { title: 'Setup project structure', description: 'Create folder structure and configure build tools' },
                    { title: 'Design UI components', description: 'Create reusable component library with proper styling' },
                    { title: 'Implement routing', description: 'Set up page navigation and route protection' },
                    { title: 'Add form validation', description: 'Implement client-side form validation with error handling' },
                    { title: 'Optimize performance', description: 'Add lazy loading and code splitting for better performance' },
                ];
            }

            // Backend/API context
            if (lowercaseContext.includes('backend') || lowercaseContext.includes('api') || lowercaseContext.includes('server') || lowercaseContext.includes('nest')) {
                return [
                    { title: 'Design API endpoints', description: 'Define RESTful API routes and request/response schemas' },
                    { title: 'Implement authentication', description: 'Add JWT-based authentication and authorization' },
                    { title: 'Setup database models', description: 'Create database schema and ORM models' },
                    { title: 'Add input validation', description: 'Implement request validation with proper error messages' },
                    { title: 'Write API documentation', description: 'Document endpoints with Swagger/OpenAPI' },
                ];
            }

            // Database context
            if (lowercaseContext.includes('database') || lowercaseContext.includes('sql') || lowercaseContext.includes('prisma')) {
                return [
                    { title: 'Design database schema', description: 'Create normalized tables with proper relationships' },
                    { title: 'Add database migrations', description: 'Set up migration scripts for schema changes' },
                    { title: 'Create seed data', description: 'Add initial data for development and testing' },
                    { title: 'Optimize queries', description: 'Add indexes and optimize slow database queries' },
                    { title: 'Setup backups', description: 'Configure automated database backup strategy' },
                ];
            }
        }

        // Default fallback suggestions
        return [
            {
                title: 'Review project documentation',
                description: 'Check and update project README and API documentation',
            },
            {
                title: 'Code review pending PRs',
                description: 'Review and provide feedback on open pull requests',
            },
            {
                title: 'Fix critical bugs',
                description: 'Address high-priority bugs reported by users',
            },
            {
                title: 'Write unit tests',
                description: 'Improve test coverage for recent features',
            },
            {
                title: 'Optimize performance',
                description: 'Identify and optimize performance bottlenecks',
            },
        ];
    }
}
