import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { Task, TaskStatus } from './interfaces';

@Injectable()
export class TasksService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
        const task = await this.prisma.task.create({
            data: {
                ...createTaskDto,
                userId,
                status: createTaskDto.status || TaskStatus.TODO,
            },
        });

        return task as Task;
    }

    async findAll(userId: string): Promise<Task[]> {
        const tasks = await this.prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return tasks as Task[];
    }

    async findOne(id: string, userId: string): Promise<Task> {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        if (task.userId !== userId) {
            throw new ForbiddenException('You do not have access to this task');
        }

        return task as Task;
    }

    async update(id: string, userId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        // Verify ownership
        await this.findOne(id, userId);

        const task = await this.prisma.task.update({
            where: { id },
            data: updateTaskDto,
        });

        return task as Task;
    }

    async remove(id: string, userId: string): Promise<void> {
        // Verify ownership
        await this.findOne(id, userId);

        await this.prisma.task.delete({
            where: { id },
        });
    }

    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
}
