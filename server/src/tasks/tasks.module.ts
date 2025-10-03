import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AiService } from './ai.service';
import { AuthModule } from '../auth';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [EmailModule, AuthModule],
    controllers: [TasksController],
    providers: [TasksService, AiService],
    exports: [TasksService],
})
export class TasksModule { }
