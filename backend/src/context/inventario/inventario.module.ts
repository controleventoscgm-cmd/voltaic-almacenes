import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioController } from './presentation/inventario.controller';
import { InventarioService } from './application/inventario.service';
import { InventarioEventListener } from './application/inventario.event-listener';
import { Producto } from './domain/producto.entity';
import { MovimientoInventario } from './domain/movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, MovimientoInventario])],
  controllers: [InventarioController],
  providers: [InventarioService, InventarioEventListener],
})
export class InventarioModule {}