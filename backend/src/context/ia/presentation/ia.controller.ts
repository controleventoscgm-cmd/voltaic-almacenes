import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { IaService } from '../application/ia.service';
import { IaVentasService } from '../application/ia.ventas.service';
import { IaComprasService } from '../application/ia.compras.service';
import { IaAsistenteService } from '../application/ia.asistente.service';

@Controller('api/v1/ia')
export class IaController {
  constructor(
    private readonly iaService: IaService,
    private readonly iaVentasService: IaVentasService,
    private readonly iaComprasService: IaComprasService,
    private readonly iaAsistenteService: IaAsistenteService // NUEVO
  ) {}

  @Post('interpretar-texto')
  async interpretar(@Body() body: { texto: string }) {
    if (!body.texto || body.texto.trim().length < 5) {
      return { error: 'El texto es demasiado corto o inválido.' };
    }
    const resultado = await this.iaService.interpretarTexto(body.texto);
    return { mensaje: 'Interpretación exitosa', datos: resultado };
  }

  @Post('interpretar-venta')
  async interpretarVenta(@Req() req: Request, @Body() body: { texto: string }) {
    const tenantId = (req as any).tenantId as string;
    if (!body.texto) return { error: 'Falta el texto' };
    const resultado = await this.iaVentasService.interpretarVenta(tenantId, body.texto);
    return resultado;
  }

  @Post('interpretar-factura')
  async interpretarFactura(@Req() req: Request, @Body() body: { imagen: string }) {
    const tenantId = (req as any).tenantId as string;
    const resultado = await this.iaComprasService.interpretarFactura(tenantId, body.imagen);
    return resultado;
  }

  // NUEVO ENDPOINT PARA EL ASISTENTE
  @Post('asistente')
  async asistente(@Body() body: { mensaje: string }) {
    if (!body.mensaje) return { error: 'Falta el mensaje' };
    const respuesta = await this.iaAsistenteService.responder(body.mensaje);
    return { respuesta };
  }
}