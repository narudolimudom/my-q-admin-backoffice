import { IsEnum, IsOptional } from 'class-validator';
import { QueueStatus } from '@prisma/client';

export class UpdateQueueStatusDto {
  @IsEnum(QueueStatus)
  status: QueueStatus;

  @IsOptional()
  reason?: string;
}
