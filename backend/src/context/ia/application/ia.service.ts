import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('IA_API_KEY');
    const baseURL = this.configService.get<string>('IA_BASE_URL');

    if (!apiKey) {
      this.logger.warn('IA_API_KEY no esta configurada en el .env. El modulo de IA fallara al usarse.');
    }

    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
      baseURL: baseURL || 'https://api.openai.com/v1',
    });
  }

  async interpretarTexto(texto: string): Promise<any> {
    const model = this.configService.get<string>('IA_MODEL') || 'gpt-4o-mini';

    const systemPrompt = `
      Eres un asistente de inventario experto. Tu tarea es extraer informacion de compras de un texto en lenguaje natural.
      Debes identificar el proveedor y una lista de productos con sus cantidades.
      Responde ESTRICTAMENTE en formato JSON con esta estructura, sin texto adicional ni markdown:
      {
        "proveedor": "string",
        "items": [
          {
            "producto": "string",
            "cantidad": number
          }
        ]
      }
      Si no puedes identificar el proveedor, devuelve "proveedor": null.
      Si no puedes identificar un producto, no lo incluyas en el array.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: texto }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Error al llamar a la API de IA: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al procesar el texto con la IA. Verifique la configuracion.');
    }
  }
}