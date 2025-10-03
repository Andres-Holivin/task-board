import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const result = controller.getHello();

      expect(result).toBe('Hello World!');
    });

    it('should always return the same message', () => {
      const result1 = controller.getHello();
      const result2 = controller.getHello();
      const result3 = controller.getHello();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe('Hello World!');
    });

    it('should return a string', () => {
      const result = controller.getHello();

      expect(typeof result).toBe('string');
    });
  });

  describe('getHealth', () => {
    it('should return health status with ok status', async () => {
      const result = await controller.getHealth();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    }, 15000);

    it('should return a valid ISO timestamp', async () => {
      const result = await controller.getHealth();

      expect(result.timestamp).toBeDefined();
      const timestamp = new Date(result.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toISOString()).toBe(result.timestamp);
    }, 15000);

    it('should return different timestamps on multiple calls', async () => {
      const result1 = await controller.getHealth();

      // Wait a small amount to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const result2 = await controller.getHealth();

      expect(result1.timestamp).not.toBe(result2.timestamp);
    }, 25000);

    it('should have correct response structure', async () => {
      const result = await controller.getHealth();

      expect(Object.keys(result)).toEqual(['status', 'timestamp']);
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
    }, 15000);

    it('should complete within reasonable time', async () => {
      const startTime = Date.now();
      await controller.getHealth();
      const endTime = Date.now();

      // Should complete within 12 seconds (11 seconds delay + 1 second buffer)
      expect(endTime - startTime).toBeGreaterThanOrEqual(11000);
      expect(endTime - startTime).toBeLessThan(13000);
    }, 15000); // Set test timeout to 15 seconds

    it('should always return status as ok', async () => {
      const result = await controller.getHealth();

      expect(result.status).toBe('ok');
      expect(result.status).not.toBe('error');
      expect(result.status).not.toBe('degraded');
    }, 15000);

    it('should return timestamp in the correct format', async () => {
      const result = await controller.getHealth();

      // ISO 8601 format regex
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(result.timestamp).toMatch(isoRegex);
    }, 15000);
  });
});
