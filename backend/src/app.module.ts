import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from './context/tenant/tenant.module';
import { InventarioModule } from './context/inventario/inventario.module';
import { ComprasModule } from './context/compras/compras.module';
import { VentasModule } from './context/ventas/ventas.module';
import { AnalyticsModule } from './context/analytics/analytics.module';
import { IaModule } from './context/ia/ia.module';
import { ReportesModule } from './context/reportes/reportes.module';
import { TransbankModule } from './context/transbank/transbank.module';
import { ClienteModule } from './context/clientes/cliente.module';
import { TenantMiddleware } from './context/shared/middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          };
        }
        return {
          type: 'sqlite',
          database: process.env.DB_DATABASE || 'voltaic.sqlite',
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    TenantModule,
    InventarioModule,
    ComprasModule,
    VentasModule,
    AnalyticsModule,
    IaModule,
    ReportesModule,
    TransbankModule,
    ClienteModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Eximimos las rutas de CREAR y BUSCAR almacenes del middleware de seguridad
    consumer.apply(TenantMiddleware).exclude(
      { path: 'api/v1/tenants', method: RequestMethod.POST },
      { path: 'api/v1/tenants/nombre/:name', method: RequestMethod.GET }
    ).forRoutes(
      'api/v1/inventario/*',
      'api/v1/compras/*',
      'api/v1/ventas/*',
      'api/v1/analytics/*',
      'api/v1/ia/*',
      'api/v1/tenants/*', // Esto cubre el PATCH de configuración
      'api/v1/transbank/*',
      'api/v1/clientes/*'
    );
  }
}