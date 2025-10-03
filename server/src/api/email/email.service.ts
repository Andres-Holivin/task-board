import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailType } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { SendEmailDTO } from './dto/email.dto';
import moment from 'moment';
import { Env } from '../../config/env';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService<Env, true>, private readonly prisma: PrismaService) {

        // Setup Nodemailer transporter
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST', { infer: true }),
            port: this.configService.get('SMTP_PORT', { infer: true }),
            secure: false, // true for 465, false for other ports
            auth: {
                user: this.configService.get('SMTP_USER', { infer: true }),
                pass: this.configService.get('SMTP_PASS', { infer: true }),
            },
        });
    }

    /**
     * Kirim email notifikasi untuk task baru
     */
    async sendEmail(sendEmailDTO: SendEmailDTO): Promise<void> {
        const emailTemplate = await this.prisma.emailTemplate.findFirstOrThrow({
            where: { emailType: sendEmailDTO.emailType },
        });
        const body = sendEmailDTO.variables ? this.bindTemplate(emailTemplate.body, sendEmailDTO.variables) : emailTemplate.body;
        const subject = sendEmailDTO.variables ? this.bindTemplate(emailTemplate.subject, sendEmailDTO.variables) : emailTemplate.subject;


        // Simpan log ke database dengan status PENDING
        const emailLog = await this.prisma.emailLog.create({
            data: {
                to: sendEmailDTO.to,
                subject: subject,
                body,
                status: 'PENDING',

            },
        });

        try {
            // Kirim email
            await this.transporter.sendMail({
                from: `"${this.configService.get('SMTP_SENDER_NAME', { infer: true })}" <${this.configService.get('SMTP_USER', { infer: true })}>`,
                to: sendEmailDTO.to,
                subject: subject,
                html: body,
            });

            // Update status ke SENT
            await this.prisma.emailLog.update({
                where: { id: emailLog.id },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                },
            });

            this.logger.log(`Email berhasil dikirim ke ${sendEmailDTO.to} untuk task ${sendEmailDTO.emailType}`);
        } catch (error) {
            // Update status ke FAILED dan simpan error
            await this.prisma.emailLog.update({
                where: { id: emailLog.id },
                data: {
                    status: 'FAILED',
                    error: error.message,
                },
            });

            this.logger.error(`Gagal mengirim email ke ${sendEmailDTO.to}: ${error.message}`);
            // Tidak throw error agar tidak mengganggu proses pembuatan task
        }
    }
    bindTemplate = (template: string, variables: Record<string, any>): string => {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return variables[key] !== undefined ? String(variables[key]) : match;
        });
    };

    async sendReportTaskDaily(): Promise<void> {
        try {
            this.logger.log('Starting daily task summary email sending...');

            // Get all users from Supabase
            const supabaseUrl = this.configService.get('SUPABASE_URL', { infer: true });
            const supabaseServiceKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true });

            const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }

            const data = await response.json();
            const users = data.users || [];

            this.logger.log(`Found ${users.length} users to send daily summary`);


            // Send email to each user
            for (const user of users) {
                try {
                    // Get user's task statistics
                    const totalTasks = await this.prisma.task.count({
                        where: { userId: user.id }
                    });

                    const completedTasks = await this.prisma.task.count({
                        where: {
                            userId: user.id,
                            status: 'DONE'
                        }
                    });

                    const pendingTasks = await this.prisma.task.count({
                        where: {
                            userId: user.id,
                            status: {
                                in: ['TODO', 'IN_PROGRESS']
                            }
                        }
                    });

                    // Send email with task summary
                    await this.sendEmail({
                        to: user.email,
                        emailType: EmailType.SUMMARY_TASKS_DAILY,
                        variables: {
                            date: moment().format('YYYY-MM-DD'),
                            totalTasks: totalTasks.toString(),
                            completedTasks: completedTasks.toString(),
                            pendingTasks: pendingTasks.toString(),
                        }
                    });

                    this.logger.log(`Daily summary sent to ${user.email}`);
                } catch (error) {
                    this.logger.error(`Failed to send daily summary to ${user.email}: ${error.message}`);
                    // Continue with next user even if one fails
                }
            }

            this.logger.log('Daily task summary email sending completed');
        } catch (error) {
            this.logger.error(`Error in sendReportTaskDaily: ${error.message}`);
            throw error;
        }
    }


    /**
     * Cleanup - tutup koneksi Prisma saat service di-destroy
     */
    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
}
