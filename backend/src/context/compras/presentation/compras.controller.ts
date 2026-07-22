import { Body, Controller, Post, Patch, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { ComprasService, ItemOrdenDTO } from '../application/compras.service';

@Controller('api/v1/compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post('proveedores')
  async crearProveedor(@Req() req: Request, @Body() body: { nombre: string; rut: string; whatsapp?: string }) {
    const tenantId = (req as any).tenantId as string;
    const proveedor = await this.comprasService.crearProveedor(tenantId, body.nombre, body.rut, body.whatsapp);
    return { message: 'Proveedor creado', id: proveedor.id };
  }

  @Post('ordenes')
  async crearOrden(@Req() req: Request, @Body() body: { proveedorId: string; items: ItemOrdenDTO[] }) {
    const tenantId = (req as any).tenantId as string;
    const orden = await this.comprasService.crearOrdenBorrador(tenantId, body.proveedorId, body.items);
    return { message: 'Orden de compra creada en estado BORRADOR', id: orden.id, estado: orden.estado, total: orden.total };
  }

  @Patch('ordenes/:id/confirmar')
  async confirmarOrden(@Req() req: Request, @Param('id') ordenId: string) {
    const tenantId = (req as any).tenantId as string;
    const orden = await this.comprasService.confirmarOrden(tenantId, ordenId);
    return { message: 'Orden confirmada exitosamente. Stock en proceso de actualización.', id: orden.id, estado: orden.estado };
  }
}