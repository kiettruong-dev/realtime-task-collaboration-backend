import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './apis/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './apis/auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { WorkspaceModule } from './apis/workspace/workspace.module';
import { TaskModule } from './apis/task/task.module';
import { RealtimeModule } from './gateways/realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Import the PrismaModule here
    PrismaModule,
    // Import other modules here
    AuthModule,
    WorkspaceModule,
    TaskModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
