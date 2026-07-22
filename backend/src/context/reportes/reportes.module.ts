import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './presentation/reportes.controller';
import { ReportesService } from './application/reportes.service';
import { ReportesScheduler } from './reportes.scheduler';
import { Ticket } from '../ventas/domain/ticket.entity';
import { OrdenDeCompra } from '../compras/domain/orden-de-compra.entity';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, OrdenDeCompra]), TenantModule],
  controllers: [ReportesController],
  providers: [ReportesService, ReportesScheduler],
  exports: [ReportesService],
})
export class ReportesModule {}