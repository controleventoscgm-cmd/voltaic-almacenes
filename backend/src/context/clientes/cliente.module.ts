import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteController } from './presentation/cliente.controller';
import { ClienteService } from './application/cliente.service';
import { Cliente } from './domain/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente])],
  controllers: [ClienteController],
  providers: [ClienteService],
  exports: [ClienteService],
})
export class ClienteModule {}