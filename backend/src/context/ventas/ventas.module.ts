import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasController } from './presentation/ventas.controller';
import { VentasService } from './application/ventas.service';
import { Ticket } from './domain/ticket.entity';
import { ItemTicket } from './domain/item-ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, ItemTicket])],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}