import { Body, Controller, Post, Get, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { TenantService } from '../application/tenant.service';

@Controller('api/v1/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(@Body() body: { name: string; plan: string }) {
    const tenant = await this.tenantService.create(body.name, body.plan);
    return { message: 'Tenant creado', tenantId: tenant.id, plan: tenant.plan, name: tenant.name };
  }

  @Get('nombre/:name')
  async getByName(@Req() req: Request) {
    // Modificado para obtener el tenant completo por ID desde el token
    const tenantId = (req as any).tenantId as string;
    const tenant = await this.tenantService.findById(tenantId);
    return { 
      tenantId: tenant.id, 
      name: tenant.name, 
      plan: tenant.plan,
      horaReporte: tenant.horaReporte,
      telegramChatId: tenant.telegramChatId,
      backupFrequency: tenant.backupFrequency,
      backupDayOfWeek: tenant.backupDayOfWeek,
      backupTime: tenant.backupTime,
      backupConfig: tenant.backupConfig
    };
  }

  @Patch('config')
  async updateConfig(@Req() req: Request, @Body() body: any) {
    const tenantId = (req as any).tenantId as string;
    const tenant = await this.tenantService.updateConfig(tenantId, body);
    return { message: 'Configuración guardada', tenant };
  }
}