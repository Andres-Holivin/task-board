import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { z } from 'zod';
import { TaskStatus } from '../interfaces';

// Zod schema for validation
export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;

// Class-validator version (for compatibility)
export class CreateTaskDtoClass {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;
}
