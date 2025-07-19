// src/admin-queue/admin-queue.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminQueueService } from './admin-queue.service';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';
import { CreateQueueEntryAdminDto } from './dto/create-queue-entry-admin.dto';
import { QueueStatus, TableType } from '@prisma/client';

// นำเข้า Guards และ Decorators สำหรับ Authentication และ Authorization
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard) // ใช้ JWT Auth Guard และ Roles Guard สำหรับ Controller นี้
@Roles('ADMIN') // กำหนดให้เฉพาะผู้ใช้ที่มี Role เป็น 'ADMIN' เท่านั้นที่เข้าถึง API ใน Controller นี้ได้
@Controller('admin/queue') // กำหนด prefix เส้นทางสำหรับ Admin API (เช่น /admin/queue, /admin/queue/summary)
export class AdminQueueController {
  constructor(private readonly adminQueueService: AdminQueueService) {}

  /**
   * [POST] /admin/queue/create-for-customer
   * สร้างรายการคิวใหม่สำหรับลูกค้า โดย Admin เป็นผู้ดำเนินการ
   *
   * @param createQueueEntryDto ข้อมูลสำหรับสร้างคิว (userId, partySize, tableType, notes)
   * @returns รายการคิวที่ถูกสร้างขึ้น
   */
  @Post('create-for-customer')
  async createQueueEntryForCustomer(@Body() createQueueEntryDto: CreateQueueEntryAdminDto) {
    return this.adminQueueService.createQueueEntryForCustomer(createQueueEntryDto);
  }

  /**
   * [GET] /admin/queue
   * ดึงรายการคิวทั้งหมด พร้อมตัวเลือกในการกรองตามสถานะและประเภทโต๊ะ
   *
   * @param status (Query Parameter, Optional) สถานะคิวที่ต้องการกรอง (WAITING, CALLED, SEATED, CANCELED)
   * @param tableType (Query Parameter, Optional) ประเภทโต๊ะที่ต้องการกรอง (SMALL, MEDIUM, LARGE, XLARGE)
   * @returns Array ของรายการคิว
   */
  @Get()
  async getAllQueues(
    @Query('status') status?: QueueStatus,
    @Query('tableType') tableType?: TableType,
  ) {
    return this.adminQueueService.getAllQueues(status, tableType);
  }

  /**
   * [PUT] /admin/queue/:id/status
   * อัปเดตสถานะของรายการคิวที่ระบุ (เช่น CALLED, SEATED, CANCELED)
   *
   * @param id ID ของรายการคิว
   * @param updateDto ข้อมูลสถานะใหม่ที่ต้องการอัปเดต
   * @returns รายการคิวที่ถูกอัปเดต
   */
  @Put(':id/status')
  async updateQueueStatus(@Param('id') id: string, @Body() updateDto: UpdateQueueStatusDto) {
    return this.adminQueueService.updateQueueStatus(id, updateDto);
  }

  /**
   * [DELETE] /admin/queue/:id
   * ลบรายการคิวที่ระบุ (ควรใช้ด้วยความระมัดระวัง)
   *
   * @param id ID ของรายการคิวที่ต้องการลบ
   * @returns ข้อความยืนยันการลบ
   */
  @Delete(':id')
  async deleteQueueEntry(@Param('id') id: string) {
    await this.adminQueueService.deleteQueueEntry(id);
    return { message: `Queue entry ${id} deleted successfully.` };
  }

  /**
   * [POST] /admin/queue/clear-table/:tableType
   * จำลองการ "เคลียร์โต๊ะ" ซึ่งในบริบทนี้หมายถึงการเรียกคิวถัดไปสำหรับโต๊ะประเภทนั้นๆ
   *
   * @param tableType ประเภทโต๊ะที่ถูกเคลียร์
   * @returns รายการคิวที่ถูกเรียก (สถานะเปลี่ยนเป็น CALLED)
   */
  @Post('clear-table/:tableType')
  async clearTable(@Param('tableType') tableType: TableType) {
    // ใน Service จะมี Logic ในการหาคิวถัดไปสำหรับโต๊ะประเภทนี้และเปลี่ยนสถานะเป็น CALLED
    return this.adminQueueService.clearTable(tableType);
  }

  /**
   * [GET] /admin/queue/summary
   * ดึงข้อมูลสรุปสถานะคิวทั้งหมด (เช่น จำนวนคิวที่รอ, ที่ถูกเรียก, ที่ได้ที่นั่งแล้ว)
   *
   * @returns วัตถุข้อมูลสรุปคิว
   */
  @Get('summary')
  async getQueueSummary() {
    return this.adminQueueService.getQueueSummary();
  }
}