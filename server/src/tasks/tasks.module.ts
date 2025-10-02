import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AiService } from './ai.service';

@Module({
    controllers: [TasksController],
    providers: [TasksService, AiService],
    exports: [TasksService],
})
export class TasksModule { }
