import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Producto } from '../domain/producto.entity';
import { MovimientoInventario } from '../domain/movimiento.entity';
import ExcelJS from 'exceljs';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    private readonly dataSource: DataSource,
  ) {}

  async crearProducto(
    tenantId: string, 
    sku: string, 
    nombre: string, 
    stockInicial: number, 
    stockMinimo: number, 
    precioVenta: number,
    codigoBarras: string,
    unidadMedida: string,
    fechaVencimiento: string
  ): Promise<Producto> {
    const nuevoProducto = new Producto();
    nuevoProducto.tenantId = tenantId;
    nuevoProducto.sku = sku;
    nuevoProducto.nombre = nombre;
    nuevoProducto.stockActual = stockInicial || 0;
    nuevoProducto.stockMinimo = stockMinimo || 5;
    nuevoProducto.precioVenta = precioVenta || 0;
    nuevoProducto.precioCosto = 0;
    nuevoProducto.codigoBarras = codigoBarras || null;
    nuevoProducto.unidadMedida = unidadMedida || 'unidad';
    nuevoProducto.fechaVencimiento = fechaVencimiento || null;
    
    return this.productoRepo.save(nuevoProducto);
  }

  async importarDesdeExcel(tenantId: string, file: any): Promise<{ importados: number, errores: number }> {
    if (!file) throw new BadRequestException('No se recibió el archivo');
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new BadRequestException('El Excel no tiene hojas');

    let importados = 0;
    let errores = 0;
    const productosParaGuardar: Producto[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; 

      const sku = row.getCell(1).value?.toString();
      const nombre = row.getCell(2).value?.toString();
      
      if (!sku || !nombre) {
        errores++;
        return;
      }

      const producto = new Producto();
      producto.tenantId = tenantId;
      producto.sku = sku;
      producto.nombre = nombre;
      producto.stockActual = parseFloat(row.getCell(3).value?.toString() || '0');
      producto.stockMinimo = parseFloat(row.getCell(4).value?.toString() || '5');
      producto.precioVenta = parseInt(row.getCell(5).value?.toString() || '0');
      producto.precioCosto = 0;
      producto.codigoBarras = row.getCell(6).value?.toString() || null;
      producto.unidadMedida = row.getCell(7).value?.toString() || 'unidad';
      producto.fechaVencimiento = row.getCell(8).value?.toString() || null;
      
      productosParaGuardar.push(producto);
    });

    if (productosParaGuardar.length > 0) {
      try {
        await this.productoRepo.save(productosParaGuardar);
        importados = productosParaGuardar.length;
      } catch (err) {
        throw new BadRequestException('Error al guardar en base de datos. Verifique que los SKUs no estén repetidos.');
      }
    }

    return { importados, errores };
  }

  async registrarMovimiento(tenantId: string, productoId: string, tipo: 'ENTRADA' | 'SALIDA' | 'MERMA', cantidad: number): Promise<void> {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const producto = await queryRunner.manager.findOne(Producto, { 
        where: { id: productoId, tenantId }
      });

      if (!producto) throw new NotFoundException('Producto no encontrado en este tenant');

      if (tipo === 'ENTRADA') {
        producto.stockActual += cantidad;
      } else {
        if (producto.stockActual < cantidad) {
          throw new BadRequestException(`Stock insuficiente. Actual: ${producto.stockActual}, Solicitado: ${cantidad}`);
        }
        producto.stockActual -= cantidad;
      }

      await queryRunner.manager.save(producto);
      const movimiento = queryRunner.manager.create(MovimientoInventario, { tenantId, productoId, tipo, cantidad });
      await queryRunner.manager.save(movimiento);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}