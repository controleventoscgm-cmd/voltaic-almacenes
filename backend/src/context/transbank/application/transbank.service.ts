import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TransbankService {
  private readonly logger = new Logger(TransbankService.name);

  async iniciarCobro(monto: number, tipoTarjeta: string, cuotas: number): Promise<any> {
    this.logger.log(`[TRANSBANK SIMULADO] Iniciando cobro por $${monto} - Tipo: ${tipoTarjeta} - Cuotas: ${cuotas}`);
    
    // Simulamos que la máquina tarda 3 segundos en responder
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      aprobado: true,
      monto: monto,
      tipoTarjeta: tipoTarjeta,
      cuotas: cuotas,
      codigoAutorizacion: 'AB12345',
      ultimaDigitosTarjeta: '6677',
      mensaje: 'Transacción Aprobada (Simulado)'
    };
  }
}