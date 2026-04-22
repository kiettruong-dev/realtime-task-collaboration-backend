import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthModule } from '@/apis/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
