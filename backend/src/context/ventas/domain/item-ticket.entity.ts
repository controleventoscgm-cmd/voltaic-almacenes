import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from './ticket.entity';
import { Producto } from '../../inventario/domain/producto.entity';

@Entity('items_ticket')
export class ItemTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => Ticket, ticket => ticket.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column({ type: 'uuid' })
  productoId: string;

  // NUEVA RELACIÓN: Permite a TypeORM unir los datos del producto para los reportes
  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column({ type: 'float' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;
}