import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../config/prisma.service';

@Module({
    imports: [AuthModule],
    controllers: [EmailController],
    providers: [EmailService, PrismaService],
    exports: [EmailService],
})
export class EmailModule { }
