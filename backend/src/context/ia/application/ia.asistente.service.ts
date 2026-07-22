import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class IaAsistenteService {
  private readonly logger = new Logger(IaAsistenteService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('IA_API_KEY');
    const baseURL = this.configService.get<string>('IA_BASE_URL');

    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
      baseURL: baseURL || 'https://api.deepseek.com/v1',
    });
  }

  // El "Manual" que la IA leerá para responder
  private readonly KNOWLEDGE_BASE = `
    MANUAL DE VOLTAIC ALMACENES (v1.0)
    
    1. INICIO (DASHBOARD): Muestra Ventas de Hoy, Total Productos, Alertas de Bajo Stock y Compras Pendientes.
    2. INVENTARIO: Permite carga masiva via Excel (.xlsx) o manual. Campos: SKU, Nombre, Stock, Precio, Unidad (unidad/kg/gr/lt), Vencimiento. Soporta decimales.
    3. VENTAS (POS): Búsqueda por nombre o código de barras. Copiloto IA escribe venta en lenguaje natural. Calcula IVA 19%. Métodos de pago: Efectivo (calcula vuelto), Tarjeta (Transbank), Fiado (carga deuda a cliente).
    4. CLIENTES Y FIADO: Registro de clientes con límite de crédito. Registro de abonos para descontar deudas.
    5. COMPRAS: Registro de proveedores. Lector de Facturas IA (lee foto, crea productos faltantes, sugiere precio con margen). Al confirmar compra, el stock sube automáticamente.
    6. REPORTES: Filtra por fecha. Muestra detalle de ventas y ranking de productos más vendidos. Exporta a Excel.
    7. CONFIGURACIÓN: Permite programar respaldos DB y envío de reportes diarios a Telegram.

    REGLAS DEL ASISTENTE:
    1. Responde SIEMPRE basándote en esta información.
    2. Si preguntan por funciones no listadas (facturación SII, app móvil, control de caja), dile amablemente: "Esa función aún no está disponible, pero está en nuestro roadmap."
    3. Sé breve, amable y directo. Usa listas si es necesario.
  `;

  async responder(mensajeUsuario: string): Promise<string> {
    const model = this.configService.get<string>('IA_MODEL') || 'deepseek-chat';

    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: this.KNOWLEDGE_BASE },
          { role: 'user', content: mensajeUsuario }
        ],
        temperature: 0.3, // Un poco más de creatividad para conversar, pero bajo para no inventar
      });

      return response.choices[0].message.content || 'No tengo una respuesta para eso en este momento.';
    } catch (error) {
      this.logger.error(`Error en Asistente IA: ${error.message}`, error.stack);
      throw new InternalServerErrorException('El asistente IA no está disponible en este momento. Intenta más tarde.');
    }
  }
}