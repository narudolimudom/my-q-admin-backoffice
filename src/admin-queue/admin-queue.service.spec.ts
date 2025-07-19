import { Test, TestingModule } from '@nestjs/testing';
import { AdminQueueService } from './admin-queue.service';

describe('AdminQueueService', () => {
  let service: AdminQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminQueueService],
    }).compile();

    service = module.get<AdminQueueService>(AdminQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
