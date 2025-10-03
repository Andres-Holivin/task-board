import {
    Controller,
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendEmailDTO } from './dto';

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post('send')
    sendEmail(@Body() sendEmailDTO: SendEmailDTO) {
        return this.emailService.sendEmail(sendEmailDTO);
    }
}
