import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AiService } from './ai.service';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../config/prisma.service';

@Module({
    imports: [EmailModule, AuthModule],
    controllers: [TasksController],
    providers: [TasksService, AiService, PrismaService],
    exports: [TasksService],
})
export class TasksModule { }
