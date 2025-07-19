// src/admin-queue/admin-queue.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueEntry, QueueStatus, TableType } from '@prisma/client';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';
import { CreateQueueEntryAdminDto } from './dto/create-queue-entry-admin.dto';
import { QueueUpdatesGateway } from '../queue-updates/queue-updates.gateway';
import * as moment from 'moment-timezone'

@Injectable()
export class AdminQueueService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly queueUpdatesGateway: QueueUpdatesGateway
  ) { }

  async createQueueEntryForCustomer(createQueueEntryDto: CreateQueueEntryAdminDto): Promise<QueueEntry> {
    const { userId, partySize, notes } = createQueueEntryDto;

    const userExists = await this.prismaService.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException();
    }

    const existingQueueEntry = await this.prismaService.queueEntry.findUnique({
      where: { userId: userId },
    });

    if (existingQueueEntry && (existingQueueEntry.status === QueueStatus.WAITING || existingQueueEntry.status === QueueStatus.CALLED)) {
      throw new BadRequestException();
    }

    let assignedTableType: TableType;
    if (partySize >= 1 && partySize <= 2) {
      assignedTableType = TableType.SMALL;
    } else if (partySize >= 3 && partySize <= 4) {
      assignedTableType = TableType.MEDIUM;
    } else if (partySize >= 5 && partySize <= 6) {
      assignedTableType = TableType.LARGE;
    } else if (partySize > 6) {
      assignedTableType = TableType.XLARGE;
    } else {
      throw new BadRequestException();
    }

    const today = moment().startOf("day").toDate();
    const tomorrow = moment(today).add(1, "day").toDate()

    const lastQueueEntryToday = await this.prismaService.queueEntry.findFirst({
      where: { createdAt: { gte: today, lt: tomorrow } },
      orderBy: { queueNumber: 'desc' },
    });
    const newQueueNumber = (lastQueueEntryToday?.queueNumber || 0) + 1;

    const newQueue = await this.prismaService.queueEntry.create({
      data: {
        userId,
        queueNumber: newQueueNumber,
        partySize,
        tableType: assignedTableType,
        notes,
        status: QueueStatus.WAITING,
      },
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    this.queueUpdatesGateway.emitQueueUpdate(newQueue);

    return newQueue;
  }

  async getAllQueues(status?: QueueStatus, tableType?: TableType): Promise<QueueEntry[]> {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (tableType) {
      whereClause.tableType = tableType;
    }

    return this.prismaService.queueEntry.findMany({
      where: whereClause,
      orderBy: {
        queueNumber: 'asc',
      },
      include: {
        user: { select: { email: true, name: true } }
      }
    });
  }

  async updateQueueStatus(queueId: string, updateDto: UpdateQueueStatusDto): Promise<QueueEntry> {
    console.log("AAA", await this.prismaService.queueEntry.findMany({}))
    const { status } = updateDto;
    
    const existingQueue = await this.prismaService.queueEntry.findUnique({
      where: { id: queueId },
    });

    console.log("HOW", existingQueue)

    if (!existingQueue) {
      throw new NotFoundException();
    }

    let updateData: any = { status };
    const now = new Date();

    switch (status) {
      case QueueStatus.CALLED:
        if (existingQueue.status !== QueueStatus.WAITING) {
          throw new BadRequestException();
        }
        updateData.calledAt = now;
        break;
      case QueueStatus.SEATED:
        if (existingQueue.status !== QueueStatus.CALLED && existingQueue.status !== QueueStatus.WAITING) {
          throw new BadRequestException();
        }
        updateData.seatedAt = now;
        break;
      case QueueStatus.CANCELED:
        if (existingQueue.status === QueueStatus.SEATED) {
          throw new BadRequestException();
        }
        updateData.canceledAt = now;
        break;
      case QueueStatus.WAITING:
        break;
      default:
        throw new BadRequestException();
    }

    const updatedQueue = await this.prismaService.queueEntry.update({
      where: { id: queueId },
      data: updateData,
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    this.queueUpdatesGateway.emitQueueUpdate(updatedQueue);

    return updatedQueue;
  }

  async deleteQueueEntry(queueId: string): Promise<void> {
    const existingQueue = await this.prismaService.queueEntry.findUnique({
      where: { id: queueId },
    });

    if (!existingQueue) {
      throw new NotFoundException(`ไม่พบรายการคิว ID: ${queueId}`);
    }

    await this.prismaService.queueEntry.delete({
      where: { id: queueId },
    });

    this.queueUpdatesGateway.emitQueueUpdate({ id: queueId, status: 'DELETED' })
  }

  async clearTable(tableType: TableType) {
    const nextQueue = await this.prismaService.queueEntry.findFirst({
      where: {
        tableType: tableType,
        status: QueueStatus.WAITING,
      },
      orderBy: { queueNumber: 'asc' },
    });

    if (!nextQueue) {
      throw new NotFoundException();
    }

    return this.updateQueueStatus(nextQueue.id, { status: QueueStatus.CALLED });
  }

  async getQueueSummary() {
    const totalWaiting = await this.prismaService.queueEntry.count({
      where: { status: QueueStatus.WAITING }
    });
    const totalCalled = await this.prismaService.queueEntry.count({
      where: { status: QueueStatus.CALLED }
    });
    const totalSeated = await this.prismaService.queueEntry.count({
      where: {
        status: QueueStatus.SEATED,
        createdAt: {
          gte: moment().startOf("day").toDate()
        }
      }
    });

    const waitingByTableType = await this.prismaService.queueEntry.groupBy({
      by: ['tableType'],
      where: { status: QueueStatus.WAITING },
      _count: {
        id: true,
      },
    });

    return {
      totalWaiting,
      totalCalled,
      totalSeated,
      waitingByTableType,
    };
  }
}