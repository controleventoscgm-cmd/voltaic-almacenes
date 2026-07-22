import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('productos')
@Index(['tenantId', 'sku'], { unique: true })
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  sku: string;

  @Column()
  nombre: string;

  @Column({ type: 'float', default: 0 })
  stockActual: number;

  @Column({ type: 'float', default: 5 })
  stockMinimo: number;

  @Column({ type: 'int', default: 0 })
  precioVenta: number;

  @Column({ type: 'int', default: 0 })
  precioCosto: number;

  @Column({ type: 'varchar', nullable: true })
  codigoBarras: string;

  @Column({ type: 'varchar', default: 'unidad' })
  unidadMedida: string;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: string | null;
}