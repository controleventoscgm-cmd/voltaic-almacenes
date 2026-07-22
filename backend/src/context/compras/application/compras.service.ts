import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from '../domain/proveedor.entity';
import { OrdenDeCompra } from '../domain/orden-de-compra.entity';
import { ItemOrdenCompra } from '../domain/item-orden.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface ItemOrdenDTO {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
    @InjectRepository(OrdenDeCompra)
    private readonly ordenRepo: Repository<OrdenDeCompra>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crearProveedor(tenantId: string, nombre: string, rut: string, whatsapp?: string): Promise<Proveedor> {
    const existente = await this.proveedorRepo.findOne({ where: { tenantId, rut } });
    if (existente) throw new BadRequestException('Ya existe un proveedor con este RUT');

    const proveedor = this.proveedorRepo.create({ tenantId, nombre, rut, whatsapp });
    return this.proveedorRepo.save(proveedor);
  }

  async crearOrdenBorrador(tenantId: string, proveedorId: string, items: ItemOrdenDTO[]): Promise<OrdenDeCompra> {
    const proveedor = await this.proveedorRepo.findOne({ where: { id: proveedorId, tenantId } });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado en este tenant');

    if (!items || items.length === 0) throw new BadRequestException('La orden debe tener al menos un item');

    let totalCalculado = 0;
    const itemsEntities = items.map(itemDto => {
      totalCalculado += itemDto.cantidad * itemDto.precioUnitario;
      return this.ordenRepo.manager.create(ItemOrdenCompra, {
        productoId: itemDto.productoId,
        cantidad: itemDto.cantidad,
        precioUnitario: itemDto.precioUnitario
      });
    });

    const orden = this.ordenRepo.create({
      tenantId, proveedorId, estado: 'BORRADOR', total: totalCalculado, items: itemsEntities
    });

    return this.ordenRepo.save(orden);
  }

  async confirmarOrden(tenantId: string, ordenId: string): Promise<OrdenDeCompra> {
    const orden = await this.ordenRepo.findOne({ where: { id: ordenId, tenantId }, relations: ['items'] });
    if (!orden) throw new NotFoundException('Orden de compra no encontrada');

    if (orden.estado !== 'BORRADOR') {
      throw new BadRequestException(`La orden ya está en estado ${orden.estado} y no puede ser confirmada`);
    }

    orden.estado = 'CONFIRMADA';
    const ordenGuardada = await this.ordenRepo.save(orden);

    // CAMBIO CLAVE AQUÍ: Usamos emitAsync y await para que el backend espere a que 
    // el stock se actualice antes de responderle al frontend.
    await this.eventEmitter.emitAsync('orden.confirmada', {
      tenantId: orden.tenantId,
      ordenId: orden.id,
      items: orden.items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
    });

    return ordenGuardada;
  }
}