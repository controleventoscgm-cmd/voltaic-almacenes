import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IaController } from './presentation/ia.controller';
import { IaService } from './application/ia.service';
import { IaVentasService } from './application/ia.ventas.service';
import { IaComprasService } from './application/ia.compras.service';
import { IaAsistenteService } from './application/ia.asistente.service'; // NUEVO
import { Producto } from '../inventario/domain/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  controllers: [IaController],
  providers: [IaService, IaVentasService, IaComprasService, IaAsistenteService], // NUEVO
})
export class IaModule {}