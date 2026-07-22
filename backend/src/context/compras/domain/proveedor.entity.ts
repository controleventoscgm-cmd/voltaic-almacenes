import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('proveedores')
@Index(['tenantId', 'rut'], { unique: true })
export class Proveedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  nombre: string;

  @Column()
  rut: string;

  @Column({ nullable: true })
  whatsapp: string;
}