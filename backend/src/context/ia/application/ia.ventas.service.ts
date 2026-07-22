import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { Producto } from '../../inventario/domain/producto.entity';

@Injectable()
export class IaVentasService {
  private readonly logger = new Logger(IaVentasService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {
    const apiKey = this.configService.get<string>('IA_API_KEY');
    const baseURL = this.configService.get<string>('IA_BASE_URL');

    if (!apiKey) {
      this.logger.warn('IA_API_KEY no está configurada. El módulo de IA fallará al usarse.');
    }

    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
      baseURL: baseURL || 'https://api.openai.com/v1',
    });
  }

  async interpretarVenta(tenantId: string, textoUsuario: string): Promise<any> {
    // 1. Obtener el inventario actual del Almacén
    const productos = await this.productoRepo.find({ where: { tenantId } });
    if (productos.length === 0) {
      throw new NotFoundException('No hay productos en el inventario para vender.');
    }

    // 2. Crear una lista simplificada para que la IA la lea (SKU y Nombre)
    const listaProductos = productos.map(p => ({ sku: p.sku, nombre: p.nombre }));

    // 3. Instrucciones estrictas para la IA
    const systemPrompt = `
      Eres un asistente de ventas para un punto de venta (POS).
      El usuario te dirá qué vendió en lenguaje natural (ej: "vendí 2 cocas y un pan").
      Debes comparar lo que dijo el usuario con la lista de productos disponibles y devolver un JSON estricto.
      Si no encuentras una coincidencia exacta, no inventes el producto.
      
      Lista de productos disponibles:
      ${JSON.stringify(listaProductos)}
      
      Responde SOLO con este formato JSON, sin texto adicional:
      {
        "items_encontrados": [
          { "sku": "SKU_ENCONTRADO", "cantidad": NUMERO }
        ],
        "items_no_encontrados": ["lo que el usuario dijo y no reconociste"]
      }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('IA_MODEL') || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textoUsuario }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Baja temperatura para que sea estrictamente lógico
      });

      const content = response.choices[0].message.content;
      const resultado = JSON.parse(content);

      // 4. Buscar los precios reales en la base de datos para armar el ticket
      const itemsParaTicket = [];
      for (const item of resultado.items_encontrados || []) {
        const producto = productos.find(p => p.sku === item.sku);
        if (producto) {
          itemsParaTicket.push({
            productoId: producto.id,
            nombre: producto.nombre,
            cantidad: item.cantidad,
            precioUnitario: producto.precioVenta // Usamos el precio real de la base de datos
          });
        }
      }

      return {
        mensaje: "Interpretación exitosa",
        ticket_sugerido: itemsParaTicket,
        no_reconocidos: resultado.items_no_encontrados || []
      };

    } catch (error) {
      this.logger.error(`Error en IA: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al procesar el texto con la IA.');
    }
  }
}