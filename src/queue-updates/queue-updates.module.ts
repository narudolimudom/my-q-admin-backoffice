import { Module } from '@nestjs/common';
// import { QueueUpdatesService } from './queue-updates.service';
import { QueueUpdatesGateway } from './queue-updates.gateway';

@Module({
  providers: [QueueUpdatesGateway],
  exports: [QueueUpdatesGateway]
})
export class QueueUpdatesModule {}
