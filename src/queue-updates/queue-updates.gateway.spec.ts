import { Test, TestingModule } from '@nestjs/testing';
import { QueueUpdatesGateway } from './queue-updates.gateway';

describe('QueueUpdatesGateway', () => {
  let gateway: QueueUpdatesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueUpdatesGateway],
    }).compile();

    gateway = module.get<QueueUpdatesGateway>(QueueUpdatesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
