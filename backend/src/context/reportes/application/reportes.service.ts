import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../ventas/domain/ticket.entity';
import { OrdenDeCompra } from '../../compras/domain/orden-de-compra.entity';
import { TenantService } from '../../tenant/application/tenant.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(OrdenDeCompra)
    private readonly ordenRepo: Repository<OrdenDeCompra>,
    private readonly tenantService: TenantService,
  ) {}

  async generarBackupYReporte(tenantId: string) {
    this.logger.log(`Iniciando backup/reportes para ${tenantId}...`);
    const tenant = await this.tenantService.findById(tenantId);
    const config = tenant.backupConfig || [];

    let mensaje = `📊 *Reporte - ${tenant.name}*\n\n📅 ${new Date().toLocaleDateString('es-CL')}\n\n`;

    if (config.includes('ventas')) {
      const hoy = new Date(); hoy.setHours(0,0,0,0);
      const tickets = await this.ticketRepo.find({ where: { tenantId, fechaCreacion: hoy as any }});
      const total = tickets.reduce((s, t) => s + parseFloat(t.total as any), 0);
      mensaje += `🛒 Ventas hoy: ${tickets.length}\n💰 Total: $${total.toLocaleString('es-CL')}\n\n`;
    }

    if (config.includes('compras')) {
      const pendientes = await this.ordenRepo.count({ where: { tenantId, estado: 'BORRADOR' }});
      mensaje += `📦 Compras pendientes: ${pendientes}\n\n`;
    }

    if (config.includes('db')) {
      await this.crearBackupDB(tenantId);
      mensaje += `💾 Respaldo de base de datos generado.\n`;
    }

    if (config.includes('telegram') && tenant.telegramChatId) {
      await this.enviarTelegram(mensaje, tenant.telegramChatId);
    }
    if (config.includes('email')) {
      this.logger.log(`[Email] Enviado a (simulado): ${mensaje}`);
    }
    if (config.includes('whatsapp')) {
      this.logger.log(`[WhatsApp] Enviado a (simulado): ${mensaje}`);
    }

    this.logger.log(`Proceso de ${tenant.name} completado.`);
  }

  private async enviarTelegram(mensaje: string, chatId: string) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) return;
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: 'Markdown' })
      });
    } catch (e) { this.logger.error(`Telegram error: ${e.message}`); }
  }

  private async crearBackupDB(tenantId: string) {
    try {
      const dbPath = path.resolve(process.cwd(), 'voltaic.sqlite');
      const backupDir = path.resolve(process.cwd(), 'backups');
      await fs.mkdir(backupDir, { recursive: true });
      const fecha = new Date().toISOString().split('T')[0];
      await fs.copyFile(dbPath, path.join(backupDir, `voltaic_${tenantId.substring(0,8)}_${fecha}.sqlite`));
    } catch (e) { this.logger.error(`Backup error: ${e.message}`); }
  }
}