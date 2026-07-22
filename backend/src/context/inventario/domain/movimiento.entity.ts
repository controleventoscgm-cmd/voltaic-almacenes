import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  productoId: string;

  @Column({ type: 'varchar' })
  tipo: 'ENTRADA' | 'SALIDA' | 'MERMA';

  @Column({ type: 'float' }) // <--- CAMBIO A FLOAT
  cantidad: number;

  @CreateDateColumn({ type: 'datetime' })
  fecha: Date;
}