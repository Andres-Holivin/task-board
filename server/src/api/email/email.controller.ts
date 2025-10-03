import {
    Controller,
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { FlexibleAuthGuard } from '../../auth/guards/flexible-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { type SendEmailDTO, sendEmailSchema } from './dto/email.dto';

@ApiTags('emails')
@ApiBearerAuth('JWT-auth')
@Controller('emails')
@UseGuards(FlexibleAuthGuard)
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post('send')
    @ApiOperation({ summary: 'Send an email' })
    @ApiResponse({ status: 200, description: 'Email sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token/API key' })
    @ApiResponse({ status: 500, description: 'Email service error' })
    sendEmail(@Body(new ZodValidationPipe(sendEmailSchema)) sendEmailDTO: SendEmailDTO) {
        return this.emailService.sendEmail(sendEmailDTO);
    }

    @Post('send-report-task-daily')
    @ApiOperation({ summary: 'Send daily task report email' })
    @ApiResponse({ status: 200, description: 'Daily task report sent successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token/API key' })
    @ApiResponse({ status: 500, description: 'Email service error' })
    sendReportTaskDaily() {
        return this.emailService.sendReportTaskDaily();
    }
}
