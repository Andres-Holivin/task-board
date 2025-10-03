import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AiService } from './ai.service';
import {
    createTaskSchema,
    updateTaskSchema,
    type CreateTaskDto,
    type UpdateTaskDto
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { User } from '../auth/interfaces/auth.interface';

/**
 * Tasks Controller
 * Handles all task-related HTTP requests
 * All endpoints require JWT authentication
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
        private readonly aiService: AiService,
    ) { }

    /**
     * Create a new task
     * POST /tasks
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@CurrentUser() user: User, @Body(new ZodValidationPipe(createTaskSchema)) createTaskDto: CreateTaskDto) {
        return this.tasksService.create(user, createTaskDto);
    }

    /**
     * Get all tasks for the authenticated user
     * GET /tasks
     */
    @Get()
    findAll(@CurrentUser() user: User) {
        return this.tasksService.findAll(user.id);
    }

    /**
     * Get AI-generated task suggestions
     * GET /tasks/suggestions?context=optional
     * Note: Must be placed before /:id route to avoid conflicts
     */
    @Get('suggestions')
    async getSuggestions(
        @CurrentUser() user: User,
        @Query('context') context?: string,
    ) {
        return this.aiService.generateTaskSuggestions(context);
    }

    /**
     * Get a specific task by ID
     * GET /tasks/:id
     */
    @Get(':id')
    findOne(
        @CurrentUser() user: User,
        @Param('id') id: string,
    ) {
        return this.tasksService.findOne(id, user.id);
    }

    /**
     * Update a task
     * PATCH /tasks/:id
     */
    @Patch(':id')
    update(
        @CurrentUser() user: User,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(updateTaskSchema)) updateTaskDto: UpdateTaskDto,
    ) {
        return this.tasksService.update(id, user.id, updateTaskDto);
    }

    /**
     * Delete a task
     * DELETE /tasks/:id
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @CurrentUser() user: User,
        @Param('id') id: string,
    ) {
        return this.tasksService.remove(id, user.id);
    }
}
