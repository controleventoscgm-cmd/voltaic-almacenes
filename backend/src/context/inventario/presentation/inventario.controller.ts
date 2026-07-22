import { Body, Controller, Post, Get, Patch, Delete, Param, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { InventarioService } from '../application/inventario.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../domain/producto.entity';

@Controller('api/v1/inventario')
export class InventarioController {
  constructor(
    private readonly inventarioService: InventarioService,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  @Post('productos')
  async crearProducto(@Req() req: Request, @Body() body: any) {
    const tenantId = (req as any).tenantId as string;
    const producto = await this.inventarioService.crearProducto(
      tenantId, 
      body.sku, 
      body.nombre, 
      body.stockInicial, 
      body.stockMinimo,
      body.precioVenta,
      body.codigoBarras,
      body.unidadMedida,
      body.fechaVencimiento
    );
    return { message: 'Producto creado', id: producto.id, sku: producto.sku };
  }

  // NUEVO ENDPOINT PARA SUBIR EXCEL
  @Post('importar-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importarExcel(@Req() req: Request, @UploadedFile() file: any) {
    const tenantId = (req as any).tenantId as string;
    const resultado = await this.inventarioService.importarDesdeExcel(tenantId, file);
    return { message: `Importación finalizada: ${resultado.importados} productos guardados.`, ...resultado };
  }

  @Get('productos')
  async obtenerProductos(@Req() req: Request) {
    const tenantId = (req as any).tenantId as string;
    return await this.productoRepo.find({ where: { tenantId } });
  }

  @Patch('productos/:id')
  async actualizarProducto(@Req() req: Request, @Param('id') id: string, @Body() body: Partial<Producto>) {
    const tenantId = (req as any).tenantId as string;
    const producto = await this.productoRepo.findOne({ where: { id, tenantId } });
    if (!producto) throw new Error('Producto no encontrado');
    Object.assign(producto, body);
    await this.productoRepo.save(producto);
    return { message: 'Producto actualizado' };
  }

  @Delete('productos/:id')
  async eliminarProducto(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as any).tenantId as string;
    const resultado = await this.productoRepo.delete({ id, tenantId });
    if (resultado.affected === 0) throw new Error('No se pudo eliminar');
    return { message: 'Producto eliminado' };
  }
}