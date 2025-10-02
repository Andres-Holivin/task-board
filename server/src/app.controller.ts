import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
    @Public()
    @Get()
    getHello(): string {
        return 'Hello World!';
    }

    @Public()
    @Get('health')
    async getHealth(): Promise<{ status: string; timestamp: string; }> {
        await new Promise(resolve => setTimeout(resolve, 11000)); // Simulate some async work
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}