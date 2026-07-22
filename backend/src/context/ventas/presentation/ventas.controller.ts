import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { VentasService, ItemTicketDTO } from '../application/ventas.service';

@Controller('api/v1/ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post('tickets')
  async crearTicket(@Req() req: Request, @Body() body: { items: ItemTicketDTO[] }) {
    const tenantId = (req as any).tenantId as string;
    const ticket = await this.ventasService.crearTicket(tenantId, body.items);
    return { 
      message: 'Venta registrada exitosamente', 
      id: ticket.id, 
      total: ticket.total 
    };
  }
}