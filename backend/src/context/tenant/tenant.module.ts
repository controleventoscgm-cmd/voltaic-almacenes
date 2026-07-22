import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './presentation/tenant.controller';
import { TenantService } from './application/tenant.service';
import { Tenant } from './domain/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService], // <--- ESTO ES CRUCIAL
})
export class TenantModule {}