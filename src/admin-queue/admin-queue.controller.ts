import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminQueueService } from './admin-queue.service';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';
import { CreateQueueEntryAdminDto } from './dto/create-queue-entry-admin.dto';
import { QueueStatus, TableType } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/queue')
export class AdminQueueController {
  constructor(private readonly adminQueueService: AdminQueueService) {}

  @Post('create-for-customer')
  public async createQueueEntryForCustomer(
    @Body() createQueueEntryDto: CreateQueueEntryAdminDto,
  ) {
    return this.adminQueueService.createQueueEntryForCustomer(
      createQueueEntryDto,
    );
  }

  @Get()
  public async getAllQueues(
    @Query('status') status?: QueueStatus,
    @Query('tableType') tableType?: TableType,
  ) {
    return this.adminQueueService.getAllQueues(status, tableType);
  }

  @Put(':id/status')
  public async updateQueueStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateQueueStatusDto,
  ) {
    return this.adminQueueService.updateQueueStatus(id, updateDto);
  }

  @Delete(':id')
  public async deleteQueueEntry(@Param('id') id: string) {
    await this.adminQueueService.deleteQueueEntry(id);
    return { message: `Queue entry ${id} deleted successfully.` };
  }

  @Post('clear-table/:tableType')
  public async clearTable(@Param('tableType') tableType: TableType) {
    return this.adminQueueService.clearTable(tableType);
  }

  @Get('summary')
  public async getQueueSummary() {
    return this.adminQueueService.getQueueSummary();
  }
}
