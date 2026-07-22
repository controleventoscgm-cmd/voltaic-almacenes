import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InventarioService } from './inventario.service';

@Injectable()
export class InventarioEventListener {
  private readonly logger = new Logger(InventarioEventListener.name);

  constructor(private readonly inventarioService: InventarioService) {}

  @OnEvent('orden.confirmada')
  async handleOrdenConfirmada(payload: { tenantId: string; ordenId: string; items: { productoId: string; cantidad: number }[] }) {
    this.logger.log(`Evento recibido: orden.confirmada para orden ${payload.ordenId}. Actualizando stock...`);

    for (const item of payload.items) {
      try {
        await this.inventarioService.registrarMovimiento(
          payload.tenantId, item.productoId, 'ENTRADA', item.cantidad
        );
      } catch (error) {
        this.logger.error(`Error al actualizar stock para producto ${item.productoId}: ${error.message}`);
      }
    }
  }
}