import { Test, TestingModule } from '@nestjs/testing';
import { QueueUpdatesService } from './queue-updates.service';

describe('QueueUpdatesService', () => {
  let service: QueueUpdatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueUpdatesService],
    }).compile();

    service = module.get<QueueUpdatesService>(QueueUpdatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
