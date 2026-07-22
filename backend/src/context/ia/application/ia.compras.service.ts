import { Injectable, InternalServerErrorException, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../../inventario/domain/producto.entity';

@Injectable()
export class IaComprasService {
  private readonly logger = new Logger(IaComprasService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  async interpretarFactura(tenantId: string, base64Image: string): Promise<any> {
    if (!base64Image) throw new BadRequestException('Falta la imagen');

    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!geminiApiKey || geminiApiKey.includes('tu-api-key')) {
      throw new InternalServerErrorException('Falta configurar GEMINI_API_KEY en el .env');
    }

    const productos = await this.productoRepo.find({ where: { tenantId } });
    const listaProductos = productos.map(p => ({ sku: p.sku, nombre: p.nombre }));

    const base64Data = base64Image.split(',')[1];

    const promptTexto = `
      Eres un asistente contable experto en lectura de facturas de proveedores.
      Te enviaré la foto de una factura y una lista de los productos que maneja el almacén.
      Debes extraer de la factura los productos comprados, sus cantidades, el precio unitario (costo) y la UNIDAD DE MEDIDA.
      Las unidades de medida válidas son solo: 'unidad', 'kg', 'gr', 'lt'. Si no viene especificada, asume 'unidad'.
      Intenta hacer coincidir el nombre en la factura con el SKU o Nombre de la lista de productos.
      
      Lista de productos del almacén:
      ${JSON.stringify(listaProductos)}

      Responde SOLO con este formato JSON, sin texto adicional ni markdown:
      {
        "proveedor": "Nombre del proveedor si se ve en la factura, si no, null",
        "items_encontrados": [
          { "sku": "SKU_ENCONTRADO_O_NULL", "nombre_factura": "Nombre que decía en la factura", "cantidad": NUMERO, "precioUnitario": NUMERO, "unidadMedida": "unidad|kg|gr|lt" }
        ]
      }
    `;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      
      const body = {
        contents: [{
          parts: [
            { text: promptTexto },
            { inline_data: { mime_type: "image/jpeg", data: base64Data } }
          ]
        }],
        generationConfig: { response_mime_type: "application/json" }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`Gemini API error: ${errData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      const resultado = JSON.parse(content);

      const itemsParaOrden = [];
      for (const item of resultado.items_encontrados || []) {
        let productoId = null;
        let producto = null;

        if (item.sku) {
           producto = productos.find(p => p.sku === item.sku);
        }
        if (!producto) {
           producto = productos.find(p => p.nombre.toLowerCase().includes(item.nombre_factura.toLowerCase()));
        }

        if (producto) {
          productoId = producto.id;
        } else {
          // SI NO EXISTE: Lo creamos. El costo es el de la factura, y sugerimos un 25% de margen por defecto.
          const costo = Math.round(item.precioUnitario);
          const ventaSugerida = Math.round(costo * 1.25); 
          
          this.logger.log(`Producto no encontrado. Creando '${item.nombre_factura}' automáticamente...`);
          const nuevoProducto = this.productoRepo.create({
            tenantId,
            sku: `SKU-${Date.now().toString().slice(-6)}`,
            nombre: item.nombre_factura,
            stockActual: 0,
            stockMinimo: 5,
            precioCosto: costo, // <--- NUEVO
            precioVenta: ventaSugerida, // <--- NUEVO
            unidadMedida: item.unidadMedida || 'unidad'
          });
          const saved = await this.productoRepo.save(nuevoProducto);
          productoId = saved.id;
        }

        itemsParaOrden.push({
          productoId: productoId,
          nombre: item.nombre_factura,
          cantidad: item.cantidad,
          costo: item.precioUnitario, // <--- NUEVO
          precioUnitario: item.precioUnitario, // Se ajusta el margen en el frontend
          unidadMedida: item.unidadMedida || 'unidad'
        });
      }

      return {
        mensaje: "Factura leída exitosamente. Se crearon los productos faltantes automáticamente.",
        proveedor_sugerido: resultado.proveedor,
        items: itemsParaOrden
      };

    } catch (error) {
      this.logger.error(`Error en IA Factura (Gemini): ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al procesar la imagen con la IA.');
    }
  }
}