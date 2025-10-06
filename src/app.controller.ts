import { Controller, Get, HttpStatus } from '@nestjs/common';

import { AppService } from './app.service'; 

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Provides a simple health check and API version endpoint.
   * Responds to GET /
   */
  @Get()
  getApiStatus() {
    return {
      status: 'ok',
      message: 'Team Collaboration SaaS API is running.',
      version: '1.0.0', 
      timestamp: new Date().toISOString(),
    };
  }
}