import { Controller, Get, Req, Query, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AnalyticsService } from '../application/analytics.service';

@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('resumen')
  async getResumen(@Req() req: Request) {
    const tenantId = (req as any).tenantId as string;
    return await this.analyticsService.getResumen(tenantId);
  }

  @Get('ventas-detalle')
  async getVentasDetalle(@Req() req: Request, @Query('desde') desde: string, @Query('hasta') hasta: string) {
    const tenantId = (req as any).tenantId as string;
    return await this.analyticsService.getVentasDetalle(tenantId, desde, hasta);
  }

  @Get('ranking')
  async getRanking(@Req() req: Request, @Query('desde') desde: string, @Query('hasta') hasta: string) {
    const tenantId = (req as any).tenantId as string;
    return await this.analyticsService.getRanking(tenantId, desde, hasta);
  }

  // NUEVO ENDPOINT PARA EXCEL
  @Get('export-excel')
  async exportExcel(@Req() req: Request, @Res() res: Response, @Query('desde') desde: string, @Query('hasta') hasta: string) {
    const tenantId = (req as any).tenantId as string;
    const buffer = await this.analyticsService.generateExcelReport(tenantId, desde, hasta);
    
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.set('Content-Disposition', 'attachment; filename="reporte_voltaic.xlsx"');
    res.send(buffer);
  }
}