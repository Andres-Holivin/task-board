import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { validateEnv } from './config/env';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { GlobalAuthGuard } from './auth/guards/global-auth.guard';
import { AppController } from './app.controller';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: [path.join(process.cwd(), '.env')],
      expandVariables: true,
    }),
    AuthModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
})
export class AppModule { }
