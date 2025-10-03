import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { FlexibleAuthGuard } from '../../auth/guards/flexible-auth.guard';
import { SendEmailDTO } from './dto/email.dto';

describe('EmailController', () => {
    let controller: EmailController;
    let emailService: EmailService;

    const mockEmailService = {
        sendEmail: jest.fn(),
        sendReportTaskDaily: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EmailController],
            providers: [
                {
                    provide: EmailService,
                    useValue: mockEmailService,
                },
            ],
        })
            .overrideGuard(FlexibleAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<EmailController>(EmailController);
        emailService = module.get<EmailService>(EmailService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('sendEmail', () => {
        it('should send an email successfully', async () => {
            const sendEmailDto: SendEmailDTO = {
                to: 'recipient@example.com',
                emailType: 'TASK_CREATED',
                variables: { taskTitle: 'New Task' },
            };

            const mockResponse = {
                success: true,
                messageId: 'msg-123',
            };

            mockEmailService.sendEmail.mockResolvedValue(mockResponse);

            const result = await controller.sendEmail(sendEmailDto);

            expect(emailService.sendEmail).toHaveBeenCalledWith(sendEmailDto);
            expect(result).toEqual(mockResponse);
        });

        it('should send email without optional variables', async () => {
            const sendEmailDto: SendEmailDTO = {
                to: 'recipient@example.com',
                emailType: 'TASK_UPDATED',
            };

            const mockResponse = {
                success: true,
                messageId: 'msg-456',
            };

            mockEmailService.sendEmail.mockResolvedValue(mockResponse);

            const result = await controller.sendEmail(sendEmailDto);

            expect(emailService.sendEmail).toHaveBeenCalledWith(sendEmailDto);
            expect(result).toEqual(mockResponse);
        });

        it('should send different email types', async () => {
            const emailTypes = ['TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED'];

            for (const emailType of emailTypes) {
                const sendEmailDto: SendEmailDTO = {
                    to: 'test@example.com',
                    emailType: emailType as any,
                };

                mockEmailService.sendEmail.mockResolvedValue({ success: true });

                await controller.sendEmail(sendEmailDto);

                expect(emailService.sendEmail).toHaveBeenCalledWith(sendEmailDto);
            }

            expect(emailService.sendEmail).toHaveBeenCalledTimes(3);
        });

        it('should throw error when email sending fails', async () => {
            const sendEmailDto: SendEmailDTO = {
                to: 'invalid@example.com',
                emailType: 'TASK_DELETED',
            };

            const error = new Error('SMTP connection failed');
            mockEmailService.sendEmail.mockRejectedValue(error);

            await expect(controller.sendEmail(sendEmailDto)).rejects.toThrow(error);
            expect(emailService.sendEmail).toHaveBeenCalledWith(sendEmailDto);
        });

        it('should handle email with complex variables', async () => {
            const sendEmailDto: SendEmailDTO = {
                to: 'user@example.com',
                emailType: 'SUMMARY_TASKS_DAILY',
                variables: {
                    taskTitle: 'Complete Project',
                    taskDescription: 'Finish all pending tasks',
                    dueDate: '2025-12-31',
                    priority: 'HIGH',
                },
            };

            const mockResponse = { success: true, messageId: 'msg-789' };
            mockEmailService.sendEmail.mockResolvedValue(mockResponse);

            const result = await controller.sendEmail(sendEmailDto);

            expect(emailService.sendEmail).toHaveBeenCalledWith(sendEmailDto);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('sendReportTaskDaily', () => {
        it('should send daily task report successfully', async () => {
            mockEmailService.sendReportTaskDaily.mockResolvedValue(undefined);

            const result = await controller.sendReportTaskDaily();

            expect(emailService.sendReportTaskDaily).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        it('should call service method without parameters', async () => {
            mockEmailService.sendReportTaskDaily.mockResolvedValue(undefined);

            await controller.sendReportTaskDaily();

            expect(emailService.sendReportTaskDaily).toHaveBeenCalledWith();
        });

        it('should throw error when daily report sending fails', async () => {
            const error = new Error('Failed to fetch tasks for report');
            mockEmailService.sendReportTaskDaily.mockRejectedValue(error);

            await expect(controller.sendReportTaskDaily()).rejects.toThrow(error);
            expect(emailService.sendReportTaskDaily).toHaveBeenCalled();
        });

        it('should handle multiple daily report requests', async () => {
            mockEmailService.sendReportTaskDaily.mockResolvedValue(undefined);

            await controller.sendReportTaskDaily();
            await controller.sendReportTaskDaily();

            expect(emailService.sendReportTaskDaily).toHaveBeenCalledTimes(2);
        });

        it('should complete successfully even when called repeatedly', async () => {
            mockEmailService.sendReportTaskDaily.mockResolvedValue(undefined);

            const result1 = await controller.sendReportTaskDaily();
            const result2 = await controller.sendReportTaskDaily();
            const result3 = await controller.sendReportTaskDaily();

            expect(emailService.sendReportTaskDaily).toHaveBeenCalledTimes(3);
            expect(result1).toBeUndefined();
            expect(result2).toBeUndefined();
            expect(result3).toBeUndefined();
        });
    });
});
