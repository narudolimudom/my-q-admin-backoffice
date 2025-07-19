import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AdminQueueModule } from './admin-queue/admin-queue.module';
import { QueueUpdatesGateway } from './queue-updates/queue-updates.gateway';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AdminQueueModule
  ],
  controllers: [AppController],
  providers: [AppService, QueueUpdatesGateway],
})
export class AppModule {}
