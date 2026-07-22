import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasController } from './presentation/compras.controller';
import { ComprasService } from './application/compras.service';
import { Proveedor } from './domain/proveedor.entity';
import { OrdenDeCompra } from './domain/orden-de-compra.entity';
import { ItemOrdenCompra } from './domain/item-orden.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor, OrdenDeCompra, ItemOrdenCompra])],
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}