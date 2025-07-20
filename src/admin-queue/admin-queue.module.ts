import { Module } from '@nestjs/common';
import { AdminQueueService } from './admin-queue.service';
import { AdminQueueController } from './admin-queue.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QueueUpdatesModule } from 'src/queue-updates/queue-updates.module';

@Module({
  imports: [PrismaModule, QueueUpdatesModule],
  providers: [AdminQueueService],
  controllers: [AdminQueueController],
})
export class AdminQueueModule {}
