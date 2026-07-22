import { Body, Controller, Post } from '@nestjs/common';
import { IaService } from './application/ia.service'; // <-- AQUÍ EL CAMBIO (un solo punto)

@Controller('api/v1/ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('interpretar-texto')
  async interpretar(@Body() body: { texto: string }) {
    if (!body.texto || body.texto.trim().length < 5) {
      return { error: 'El texto es demasiado corto o inválido.' };
    }
    
    const resultado = await this.iaService.interpretarTexto(body.texto);
    return { mensaje: 'Interpretación exitosa', datos: resultado };
  }
}