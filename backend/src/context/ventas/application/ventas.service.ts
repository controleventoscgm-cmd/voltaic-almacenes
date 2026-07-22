import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../domain/ticket.entity';
import { ItemTicket } from '../domain/item-ticket.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface ItemTicketDTO {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crearTicket(tenantId: string, items: ItemTicketDTO[]): Promise<Ticket> {
    if (!items || items.length === 0) {
      throw new BadRequestException('El ticket debe tener al menos un item');
    }

    let totalCalculado = 0;
    const itemsEntities = items.map(itemDto => {
      totalCalculado += itemDto.cantidad * itemDto.precioUnitario;
      return this.ticketRepo.manager.create(ItemTicket, {
        productoId: itemDto.productoId,
        cantidad: itemDto.cantidad,
        precioUnitario: itemDto.precioUnitario
      });
    });

    const ticket = this.ticketRepo.create({
      tenantId,
      total: totalCalculado,
      items: itemsEntities
    });

    const ticketGuardado = await this.ticketRepo.save(ticket);

    await this.eventEmitter.emitAsync('ticket.creado', {
      tenantId: ticket.tenantId,
      ticketId: ticket.id,
      items: ticket.items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
    });

    return ticketGuardado;
  }
}