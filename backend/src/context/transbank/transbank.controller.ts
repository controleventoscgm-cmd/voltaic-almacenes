import { Body, Controller, Post } from '@nestjs/common';
import { TransbankService } from './application/transbank.service';

@Controller('api/v1/transbank')
export class TransbankController {
  constructor(private readonly transbankService: TransbankService) {}

  @Post('pagar')
  async pagar(@Body() body: { monto: number; tipoTarjeta: string; cuotas: number }) {
    if (!body.monto || body.monto <= 0) return { error: 'Monto inválido' };
    return await this.transbankService.iniciarCobro(body.monto, body.tipoTarjeta, body.cuotas);
  }
}