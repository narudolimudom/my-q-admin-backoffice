import { IsInt, Min, IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { TableType } from '@prisma/client';

export class CreateQueueEntryAdminDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  partySize: number;

  @IsOptional()
  @IsEnum(TableType)
  tableType?: TableType;

  @IsOptional()
  @IsString()
  notes?: string;
}
