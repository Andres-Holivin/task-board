import { z } from 'zod';

// Zod schema for validation
export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
