import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../auth/interfaces/auth.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksController', () => {
    let controller: TasksController;
    let tasksService: TasksService;
    let aiService: AiService;

    const mockTasksService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockAiService = {
        generateTaskSuggestions: jest.fn(),
    };

    const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        emailConfirmed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'TODO',
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
                    useValue: mockTasksService,
                },
                {
                    provide: AiService,
                    useValue: mockAiService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<TasksController>(TasksController);
        tasksService = module.get<TasksService>(TasksService);
        aiService = module.get<AiService>(AiService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new task successfully', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'New Task',
                description: 'New Description',
                status: 'TODO',
            };

            mockTasksService.create.mockResolvedValue(mockTask);

            const result = await controller.create(mockUser, createTaskDto);

            expect(tasksService.create).toHaveBeenCalledWith(mockUser, createTaskDto);
            expect(result).toEqual(mockTask);
        });

        it('should create a task without optional fields', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'Minimal Task',
            };

            const minimalTask = { ...mockTask, description: null };
            mockTasksService.create.mockResolvedValue(minimalTask);

            const result = await controller.create(mockUser, createTaskDto);

            expect(tasksService.create).toHaveBeenCalledWith(mockUser, createTaskDto);
            expect(result).toEqual(minimalTask);
        });

        it('should throw error when task creation fails', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'Failed Task',
            };

            const error = new Error('Database error');
            mockTasksService.create.mockRejectedValue(error);

            await expect(controller.create(mockUser, createTaskDto)).rejects.toThrow(error);
            expect(tasksService.create).toHaveBeenCalledWith(mockUser, createTaskDto);
        });
    });

    describe('findAll', () => {
        it('should return all tasks for authenticated user', async () => {
            const mockTasks = [mockTask, { ...mockTask, id: 'task-456', title: 'Another Task' }];
            mockTasksService.findAll.mockResolvedValue(mockTasks);

            const result = await controller.findAll(mockUser);

            expect(tasksService.findAll).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockTasks);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when user has no tasks', async () => {
            mockTasksService.findAll.mockResolvedValue([]);

            const result = await controller.findAll(mockUser);

            expect(tasksService.findAll).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should throw error when database fails', async () => {
            const error = new Error('Database connection error');
            mockTasksService.findAll.mockRejectedValue(error);

            await expect(controller.findAll(mockUser)).rejects.toThrow(error);
            expect(tasksService.findAll).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('getSuggestions', () => {
        it('should generate AI task suggestions without context', async () => {
            const mockSuggestions = {
                suggestions: ['Task 1', 'Task 2', 'Task 3'],
            };
            mockAiService.generateTaskSuggestions.mockResolvedValue(mockSuggestions);

            const result = await controller.getSuggestions(mockUser);

            expect(aiService.generateTaskSuggestions).toHaveBeenCalledWith(undefined);
            expect(result).toEqual(mockSuggestions);
        });

        it('should generate AI task suggestions with context', async () => {
            const context = 'web development project';
            const mockSuggestions = {
                suggestions: ['Setup project', 'Create API', 'Write tests'],
            };
            mockAiService.generateTaskSuggestions.mockResolvedValue(mockSuggestions);

            const result = await controller.getSuggestions(mockUser, context);

            expect(aiService.generateTaskSuggestions).toHaveBeenCalledWith(context);
            expect(result).toEqual(mockSuggestions);
        });

        it('should throw error when AI service fails', async () => {
            const error = new Error('AI service unavailable');
            mockAiService.generateTaskSuggestions.mockRejectedValue(error);

            await expect(controller.getSuggestions(mockUser, 'context')).rejects.toThrow(error);
            expect(aiService.generateTaskSuggestions).toHaveBeenCalledWith('context');
        });
    });

    describe('findOne', () => {
        it('should return a specific task by ID', async () => {
            const taskId = 'task-123';
            mockTasksService.findOne.mockResolvedValue(mockTask);

            const result = await controller.findOne(mockUser, taskId);

            expect(tasksService.findOne).toHaveBeenCalledWith(taskId, mockUser.id);
            expect(result).toEqual(mockTask);
        });

        it('should throw error when task is not found', async () => {
            const taskId = 'non-existent-task';
            const error = new Error('Task not found');
            mockTasksService.findOne.mockRejectedValue(error);

            await expect(controller.findOne(mockUser, taskId)).rejects.toThrow(error);
            expect(tasksService.findOne).toHaveBeenCalledWith(taskId, mockUser.id);
        });

        it('should throw error when user tries to access another user task', async () => {
            const taskId = 'task-456';
            const error = new Error('Unauthorized access');
            mockTasksService.findOne.mockRejectedValue(error);

            await expect(controller.findOne(mockUser, taskId)).rejects.toThrow(error);
            expect(tasksService.findOne).toHaveBeenCalledWith(taskId, mockUser.id);
        });
    });

    describe('update', () => {
        it('should update a task successfully', async () => {
            const taskId = 'task-123';
            const updateTaskDto: UpdateTaskDto = {
                title: 'Updated Task',
                status: 'IN_PROGRESS',
            };

            const updatedTask = { ...mockTask, ...updateTaskDto };
            mockTasksService.update.mockResolvedValue(updatedTask);

            const result = await controller.update(mockUser, taskId, updateTaskDto);

            expect(tasksService.update).toHaveBeenCalledWith(taskId, mockUser.id, updateTaskDto);
            expect(result).toEqual(updatedTask);
        });

        it('should update only specified fields', async () => {
            const taskId = 'task-123';
            const updateTaskDto: UpdateTaskDto = {
                status: 'DONE',
            };

            const updatedTask = { ...mockTask, status: 'DONE' };
            mockTasksService.update.mockResolvedValue(updatedTask);

            const result = await controller.update(mockUser, taskId, updateTaskDto);

            expect(tasksService.update).toHaveBeenCalledWith(taskId, mockUser.id, updateTaskDto);
            expect(result.status).toBe('DONE');
        });

        it('should throw error when task is not found', async () => {
            const taskId = 'non-existent-task';
            const updateTaskDto: UpdateTaskDto = { title: 'Updated' };
            const error = new Error('Task not found');
            mockTasksService.update.mockRejectedValue(error);

            await expect(controller.update(mockUser, taskId, updateTaskDto)).rejects.toThrow(error);
            expect(tasksService.update).toHaveBeenCalledWith(taskId, mockUser.id, updateTaskDto);
        });
    });

    describe('remove', () => {
        it('should delete a task successfully', async () => {
            const taskId = 'task-123';
            mockTasksService.remove.mockResolvedValue(undefined);

            const result = await controller.remove(mockUser, taskId);

            expect(tasksService.remove).toHaveBeenCalledWith(taskId, mockUser.id);
            expect(result).toBeUndefined();
        });

        it('should throw error when task is not found', async () => {
            const taskId = 'non-existent-task';
            const error = new Error('Task not found');
            mockTasksService.remove.mockRejectedValue(error);

            await expect(controller.remove(mockUser, taskId)).rejects.toThrow(error);
            expect(tasksService.remove).toHaveBeenCalledWith(taskId, mockUser.id);
        });

        it('should throw error when user tries to delete another user task', async () => {
            const taskId = 'task-456';
            const error = new Error('Unauthorized access');
            mockTasksService.remove.mockRejectedValue(error);

            await expect(controller.remove(mockUser, taskId)).rejects.toThrow(error);
            expect(tasksService.remove).toHaveBeenCalledWith(taskId, mockUser.id);
        });
    });
});
