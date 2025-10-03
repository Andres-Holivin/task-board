import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Task, TaskStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../auth/interfaces/auth.interface';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class TasksService {

    constructor(private readonly emailService: EmailService, private readonly prisma: PrismaService) {
    }

    async create(user: User, createTaskDto: CreateTaskDto): Promise<Task> {
        const task = await this.prisma.task.create({
            data: {
                ...createTaskDto,
                userId: user.id,
                status: createTaskDto.status || TaskStatus.TODO,
            },
        });

        const taskResult = task as Task;

        // Kirim email notifikasi secara asynchronous (tidak block)
        await this.sendTaskCreatedEmail(user, taskResult);

        return taskResult;
    }

    /**
     * Helper method untuk kirim email notifikasi task created
     */
    private async sendTaskCreatedEmail(user: User, task: Task): Promise<void> {
        try {
            const email = user.email;
            if (!email) {
                console.error('Failed to get user email');
                return;
            }
            // Kirim email
            await this.emailService.sendEmail({
                emailType: 'TASK_CREATED',
                to: email,
                variables: {
                    taskTitle: task.title,
                    taskDescription: task.description || 'No description provided',
                },
            });
        } catch (error) {
            console.error('Error in sendTaskCreatedEmail:', error);
            // Tidak throw error agar tidak mengganggu flow pembuatan task
        }
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
        console.log('UpdateTaskDto:', updateTaskDto);
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
