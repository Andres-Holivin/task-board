import { z } from 'zod';
// Zod schema for validation
export const updateTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
    description: z.string().max(500, 'Description is too long').optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;

