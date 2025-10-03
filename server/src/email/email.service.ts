import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailType, PrismaClient } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { Env } from '../config/env';
import { SendEmailDTO } from './dto';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly transporter: nodemailer.Transporter;
    private readonly prisma: PrismaClient;

    constructor(private readonly configService: ConfigService<Env, true>) {
        this.prisma = new PrismaClient();

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


    /**
     * Cleanup - tutup koneksi Prisma saat service di-destroy
     */
    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
}
