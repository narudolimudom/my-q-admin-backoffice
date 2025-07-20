// src/admin-queue/admin-queue.controller.ts
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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/queue')
export class AdminQueueController {
  constructor(private readonly adminQueueService: AdminQueueService) {}

  @Post('create-for-customer')
  async createQueueEntryForCustomer(
    @Body() createQueueEntryDto: CreateQueueEntryAdminDto,
  ) {
    return this.adminQueueService.createQueueEntryForCustomer(
      createQueueEntryDto,
    );
  }

  @Get()
  async getAllQueues(
    @Query('status') status?: QueueStatus,
    @Query('tableType') tableType?: TableType,
  ) {
    return this.adminQueueService.getAllQueues(status, tableType);
  }

  @Put(':id/status')
  async updateQueueStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateQueueStatusDto,
  ) {
    return this.adminQueueService.updateQueueStatus(id, updateDto);
  }

  @Delete(':id')
  async deleteQueueEntry(@Param('id') id: string) {
    await this.adminQueueService.deleteQueueEntry(id);
    return { message: `Queue entry ${id} deleted successfully.` };
  }

  @Post('clear-table/:tableType')
  async clearTable(@Param('tableType') tableType: TableType) {
    return this.adminQueueService.clearTable(tableType);
  }

  @Get('summary')
  async getQueueSummary() {
    return this.adminQueueService.getQueueSummary();
  }
}
