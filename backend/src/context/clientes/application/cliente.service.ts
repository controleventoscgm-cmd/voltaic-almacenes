import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../domain/cliente.entity';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async crear(tenantId: string, nombre: string, rut?: string, telefono?: string, limiteCredito?: number): Promise<Cliente> {
    const cliente = this.clienteRepo.create({ tenantId, nombre, rut, telefono, limiteCredito: limiteCredito || 0 });
    return this.clienteRepo.save(cliente);
  }

  async obtenerTodos(tenantId: string): Promise<Cliente[]> {
    return this.clienteRepo.find({ where: { tenantId } });
  }

  async registrarDeuda(tenantId: string, clienteId: string, monto: number): Promise<void> {
    const cliente = await this.clienteRepo.findOne({ where: { id: clienteId, tenantId } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const nuevoSaldo = cliente.saldoPendiente + monto;
    if (cliente.limiteCredito > 0 && nuevoSaldo > cliente.limiteCredito) {
      throw new BadRequestException('Limite de credito excedido');
    }

    cliente.saldoPendiente = nuevoSaldo;
    await this.clienteRepo.save(cliente);
  }

  async registrarAbono(tenantId: string, clienteId: string, monto: number): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({ where: { id: clienteId, tenantId } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    cliente.saldoPendiente -= monto;
    if (cliente.saldoPendiente < 0) cliente.saldoPendiente = 0;
    
    return this.clienteRepo.save(cliente);
  }
}
