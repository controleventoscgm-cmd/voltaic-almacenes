import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('clientes')
@Index(['tenantId', 'rut'], { unique: true })
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  rut: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ type: 'int', default: 0 })
  limiteCredito: number;

  @Column({ type: 'int', default: 0 })
  saldoPendiente: number;
}
