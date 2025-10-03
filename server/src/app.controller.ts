import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './shared/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
    @Public()
    @Get()
    @ApiOperation({ summary: 'Root endpoint - Hello World' })
    @ApiResponse({ status: 200, description: 'Returns Hello World message' })
    getHello(): string {
        return 'Hello World!';
    }

    @Public()
    @Get('health')
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'Service is healthy' })
    async getHealth(): Promise<{ status: string; timestamp: string; }> {
        await new Promise(resolve => setTimeout(resolve, 11000)); // Simulate some async work
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}