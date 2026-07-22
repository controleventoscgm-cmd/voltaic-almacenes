import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Proveedor } from './proveedor.entity';
import { ItemOrdenCompra } from './item-orden.entity';

@Entity('ordenes_de_compra')
export class OrdenDeCompra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  proveedorId: string;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedor;

  @Column({ type: 'varchar', default: 'BORRADOR' })
  estado: 'BORRADOR' | 'CONFIRMADA' | 'RECHAZADA';

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn({ type: 'datetime' })
  fechaCreacion: Date;

  @OneToMany(() => ItemOrdenCompra, item => item.orden, { cascade: true })
  items: ItemOrdenCompra[];
}