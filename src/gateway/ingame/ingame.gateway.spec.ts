import { Test, TestingModule } from '@nestjs/testing';
import { IngameGateway } from './ingame.gateway';

describe('IngameGateway', () => {
  let gateway: IngameGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngameGateway],
    }).compile();

    gateway = module.get<IngameGateway>(IngameGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
