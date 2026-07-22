import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ReportesService } from './application/reportes.service';
import { TenantService } from '../tenant/application/tenant.service';

@Injectable()
export class ReportesScheduler {
  private isRunning = false;

  constructor(
    private readonly reportesService: ReportesService,
    private readonly tenantService: TenantService
  ) {}

  // Se ejecuta cada minuto para revisar si a algún almacén le toca respaldo
  @Cron('* * * * *')
  async manejarBackups() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();

      const tenants = await this.tenantService.getAllTenants();

      for (const tenant of tenants) {
        if (tenant.backupFrequency === 'none') continue;
        if (tenant.backupTime !== currentTime) continue;

        if (tenant.backupFrequency === 'daily') {
          await this.reportesService.generarBackupYReporte(tenant.id);
        } else if (tenant.backupFrequency === 'weekly' && tenant.backupDayOfWeek === currentDay) {
          await this.reportesService.generarBackupYReporte(tenant.id);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }
}