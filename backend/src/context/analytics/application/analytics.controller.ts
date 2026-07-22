import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from '../application/analytics.service';

@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('resumen')
  async getResumen(@Req() req: Request) {
    const tenantId = (req as any).tenantId as string;
    return await this.analyticsService.getResumen(tenantId);
  }
}