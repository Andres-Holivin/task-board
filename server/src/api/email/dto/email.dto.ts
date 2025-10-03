import { EmailType } from '@prisma/client';
import { z } from 'zod';

export const sendEmailSchema = z.object({
    to: z.string().email('Invalid email address'),
    emailType: z.enum(EmailType),
    variables: z.record(z.string(), z.any()).optional(),
});
export type SendEmailDTO = z.infer<typeof sendEmailSchema>;