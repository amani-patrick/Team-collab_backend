import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService; 

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: () => 'Hello, Welcome to the SaaS API!', 
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return a status object with "ok"', () => {
   
      const result = appController.getApiStatus();

      expect(result.status).toBe('ok');
      expect(result.message).toContain('API is running');
      expect(result).toHaveProperty('version');
    });
  });
});