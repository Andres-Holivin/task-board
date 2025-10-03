import { EmailType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailDTO {
    @IsEmail()
    @IsNotEmpty()
    to: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(EmailType)
    emailType: EmailType;

    @IsOptional()
    variables?: Record<string, any>;
}
