import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../domain/tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async create(name: string, plan: string): Promise<Tenant> {
    const modules = plan === 'premium' 
      ? ['inventory', 'purchases', 'ai_ocr', 'analytics'] 
      : ['inventory', 'purchases'];

    const tenant = this.tenantRepo.create({ name, plan, modulesEnabled: modules });
    return this.tenantRepo.save(tenant);
  }

  async findByName(name: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { name } });
    if (!tenant) {
      throw new NotFoundException('No se encontro un almacen con ese nombre');
    }
    return tenant;
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Almacen no encontrado');
    }
    return tenant;
  }

  async updateConfig(tenantId: string, config: any) {
    const tenant = await this.findById(tenantId);
    
    if (config.horaReporte !== undefined) tenant.horaReporte = config.horaReporte;
    if (config.telegramChatId !== undefined) tenant.telegramChatId = config.telegramChatId;
    if (config.backupFrequency !== undefined) tenant.backupFrequency = config.backupFrequency;
    if (config.backupDayOfWeek !== undefined) tenant.backupDayOfWeek = config.backupDayOfWeek;
    if (config.backupTime !== undefined) tenant.backupTime = config.backupTime;
    if (config.backupConfig !== undefined) tenant.backupConfig = config.backupConfig;
    
    return this.tenantRepo.save(tenant);
  }

  async getTenantsForReport(horaActual: number) {
    return this.tenantRepo.find({ where: { horaReporte: horaActual } });
  }

  async getAllTenants() {
    return this.tenantRepo.find();
  }
}