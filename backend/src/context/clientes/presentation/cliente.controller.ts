import { Body, Controller, Post, Get, Patch, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { ClienteService } from '../application/cliente.service';

@Controller('api/v1/clientes')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  async crear(@Req() req: Request, @Body() body: { nombre: string; rut?: string; telefono?: string; limiteCredito?: number }) {
    const tenantId = (req as any).tenantId as string;
    const cliente = await this.clienteService.crear(tenantId, body.nombre, body.rut, body.telefono, body.limiteCredito);
    return { message: 'Cliente creado', id: cliente.id };
  }

  @Get()
  async obtenerTodos(@Req() req: Request) {
    const tenantId = (req as any).tenantId as string;
    return this.clienteService.obtenerTodos(tenantId);
  }

  @Patch(':id/abono')
  async registrarAbono(@Req() req: Request, @Param('id') id: string, @Body() body: { monto: number }) {
    const tenantId = (req as any).tenantId as string;
    const cliente = await this.clienteService.registrarAbono(tenantId, id, body.monto);
    return { message: 'Abono registrado', nuevoSaldo: cliente.saldoPendiente };
  }
}
