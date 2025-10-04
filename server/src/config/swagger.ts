import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Env } from "./env";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function swaggerConfig(app: INestApplication) {
    const configService = app.get(ConfigService<Env, true>);

    const nodeEnv = configService.get('NODE_ENV', { infer: true });
    const port = configService.get('PORT', { infer: true });

    if (nodeEnv !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Task Board API')
            .setDescription('The Task Board API documentation')
            .setVersion('1.0')
            .addTag('auth', 'Authentication endpoints')
            .addTag('tasks', 'Task management endpoints')
            .addTag('api-keys', 'API key management endpoints')
            .addTag('emails', 'Email notification endpoints')
            .addTag('health', 'Health check endpoints')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'JWT',
                    description: 'Enter JWT token',
                    in: 'header',
                },
                'JWT-auth',
            )
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('swagger', app, document, {
            customSiteTitle: 'Task Board API Documentation',
            customCss: '.swagger-ui .topbar { display: none }',
        });

        console.log(`📚 Swagger documentation available at http://localhost:${port}/swagger`);
    }
}