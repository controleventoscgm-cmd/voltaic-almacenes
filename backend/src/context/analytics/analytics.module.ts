import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './presentation/analytics.controller';
import { AnalyticsService } from './application/analytics.service';
import { Ticket } from '../ventas/domain/ticket.entity';
import { ItemTicket } from '../ventas/domain/item-ticket.entity';
import { Producto } from '../inventario/domain/producto.entity';
import { OrdenDeCompra } from '../compras/domain/orden-de-compra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, ItemTicket, Producto, OrdenDeCompra])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}