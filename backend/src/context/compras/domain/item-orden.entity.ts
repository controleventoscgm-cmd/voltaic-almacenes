import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrdenDeCompra } from './orden-de-compra.entity';

@Entity('items_orden_compra')
export class ItemOrdenCompra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ordenId: string;

  @ManyToOne(() => OrdenDeCompra, orden => orden.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordenId' })
  orden: OrdenDeCompra;

  @Column({ type: 'uuid' })
  productoId: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;
}