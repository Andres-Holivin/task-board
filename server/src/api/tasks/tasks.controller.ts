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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { User } from '../auth/interfaces/auth.interface';
import { createTaskSchema, type CreateTaskDto } from './dto/create-task.dto';
import { type UpdateTaskDto, updateTaskSchema } from './dto/update-task.dto';

/**
 * Tasks Controller
 * Handles all task-related HTTP requests
 * All endpoints require JWT authentication
 */
@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
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
    @ApiOperation({ summary: 'Create a new task' })
    @ApiResponse({ status: 201, description: 'Task successfully created' })
    @ApiResponse({ status: 400, description: 'Bad request - validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    create(@CurrentUser() user: User, @Body(new ZodValidationPipe(createTaskSchema)) createTaskDto: CreateTaskDto) {
        return this.tasksService.create(user, createTaskDto);
    }

    /**
     * Get all tasks for the authenticated user
     * GET /tasks
     */
    @Get()
    @ApiOperation({ summary: 'Get all tasks for the authenticated user' })
    @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    findAll(@CurrentUser() user: User) {
        return this.tasksService.findAll(user.id);
    }

    /**
     * Get AI-generated task suggestions
     * GET /tasks/suggestions?context=optional
     * Note: Must be placed before /:id route to avoid conflicts
     */
    @Get('suggestions')
    @ApiOperation({ summary: 'Get AI-generated task suggestions' })
    @ApiQuery({ name: 'context', required: false, description: 'Optional context for task suggestions' })
    @ApiResponse({ status: 200, description: 'Suggestions generated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 500, description: 'AI service error' })
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
    @ApiOperation({ summary: 'Get a specific task by ID' })
    @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 404, description: 'Task not found' })
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
    @ApiOperation({ summary: 'Update a task' })
    @ApiResponse({ status: 200, description: 'Task updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 404, description: 'Task not found' })
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
    @ApiOperation({ summary: 'Delete a task' })
    @ApiResponse({ status: 204, description: 'Task deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    remove(
        @CurrentUser() user: User,
        @Param('id') id: string,
    ) {
        return this.tasksService.remove(id, user.id);
    }
}

