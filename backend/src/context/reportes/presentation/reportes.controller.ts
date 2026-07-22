import { Controller, Get } from '@nestjs/common';
import { ReportesService } from '../application/reportes.service';

@Controller('api/v1/reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // Endpoint para forzar el reporte y probar que funciona
  @Get('test-diario')
  async testDiario() {
    // OJO: Aquí llamamos a la función nueva y le pasamos el ID del tenant actual
    // Pero como este endpoint es global, le pasaremos un ID fijo para la prueba.
    // En la vida real, el Scheduler llamará a esta función por cada tenant.
    const tenantIdForTest = '5f037093-1c8e-475c-b2ca-17859b01d6b1'; // El ID de "Los Super Bugue"
    await this.reportesService.generarBackupYReporte(tenantIdForTest);
    return { message: 'Reporte generado. Revisa tu Telegram y la carpeta backups.' };
  }
}