import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'basic' })
  plan: string;

  @Column('simple-array', { default: 'inventory,purchases' })
  modulesEnabled: string[];

  @Column({ type: 'int', default: 23 })
  horaReporte: number;

  @Column({ nullable: true })
  telegramChatId: string;

  // NUEVOS CAMPOS DE CONFIGURACIÓN
  @Column({ type: 'varchar', default: 'none' }) // 'none', 'daily', 'weekly'
  backupFrequency: string;

  @Column({ type: 'int', default: 1 }) // 0=Domingo, 1=Lunes... 6=Sabado
  backupDayOfWeek: number;

  @Column({ type: 'varchar', default: '23:00' }) // Formato HH:MM 24h
  backupTime: string;

  @Column('simple-array', { default: 'telegram,db' }) // 'telegram', 'email', 'whatsapp', 'ventas', 'compras', 'db'
  backupConfig: string[];
}