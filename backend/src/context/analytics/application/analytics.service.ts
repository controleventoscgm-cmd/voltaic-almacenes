import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../ventas/domain/ticket.entity';
import { ItemTicket } from '../../ventas/domain/item-ticket.entity';
import { Producto } from '../../inventario/domain/producto.entity';
import { OrdenDeCompra } from '../../compras/domain/orden-de-compra.entity';
import ExcelJS from 'exceljs';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(ItemTicket)
    private readonly itemTicketRepo: Repository<ItemTicket>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(OrdenDeCompra)
    private readonly ordenRepo: Repository<OrdenDeCompra>,
  ) {}

  async getResumen(tenantId: string) {
    const totalProductos = await this.productoRepo.count({ where: { tenantId } });
    
    // Buscamos directamente los productos con bajo stock
    const bajoStockLista = await this.productoRepo.createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId })
      .andWhere('p.stockActual <= p.stockMinimo')
      .getMany();

    const productosBajoStock = bajoStockLista.length;
    const comprasPendientes = await this.ordenRepo.count({ where: { tenantId, estado: 'BORRADOR' } });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const resultVentas = await this.ticketRepo.createQueryBuilder('t')
      .select('SUM(t.total)', 'totalVentas')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.fechaCreacion >= :hoy', { hoy })
      .getRawOne();

    return {
      totalProductos,
      productosBajoStock,
      comprasPendientes,
      totalVentasHoy: parseFloat(resultVentas?.totalVentas || 0),
      // Devolvemos la lista lista para el frontend
      bajoStockLista: bajoStockLista.map(p => ({
        nombre: p.nombre,
        stock: p.stockActual,
        minimo: p.stockMinimo,
        unidad: p.unidadMedida || 'unidad'
      }))
    };
  }

  async getVentasDetalle(tenantId: string, desde: string, hasta: string) {
    const query = this.ticketRepo.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.items', 'item')
      .leftJoinAndSelect('item.producto', 'producto')
      .where('ticket.tenantId = :tenantId', { tenantId });
      
    if (desde) query.andWhere('ticket.fechaCreacion >= :desde', { desde: new Date(desde) });
    if (hasta) query.andWhere('ticket.fechaCreacion <= :hasta', { hasta: new Date(hasta + ' 23:59:59') });
    
    return await query.orderBy('ticket.fechaCreacion', 'DESC').getMany();
  }

  async getRanking(tenantId: string, desde: string, hasta: string) {
    const query = this.itemTicketRepo.createQueryBuilder('item')
      .leftJoin('item.ticket', 'ticket')
      .leftJoin('item.producto', 'producto')
      .select('producto.nombre', 'nombre')
      .addSelect('SUM(item.cantidad)', 'cantidadVendida')
      .addSelect('SUM(item.cantidad * item.precioUnitario)', 'ingresoTotal')
      .addSelect('SUM(item.cantidad * producto.precioCosto)', 'costoTotal')
      .where('ticket.tenantId = :tenantId', { tenantId });
      
    if (desde) query.andWhere('ticket.fechaCreacion >= :desde', { desde: new Date(desde) });
    if (hasta) query.andWhere('ticket.fechaCreacion <= :hasta', { hasta: new Date(hasta + ' 23:59:59') });
    
    const results = await query.groupBy('producto.id').orderBy('cantidadVendida', 'DESC').limit(10).getRawMany();
    
    return results.map(r => ({
      nombre: r.nombre,
      cantidad: parseFloat(r.cantidadVendida),
      ingreso: parseFloat(r.ingresoTotal),
      costo: parseFloat(r.costoTotal || 0),
      margen: parseFloat(r.ingresoTotal) - parseFloat(r.costoTotal || 0)
    }));
  }

  // Generador de Excel
  async generateExcelReport(tenantId: string, desde: string, hasta: string): Promise<Buffer> {
    const ventas = await this.getVentasDetalle(tenantId, desde, hasta);
    const ranking = await this.getRanking(tenantId, desde, hasta);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Voltaic Almacenes';
    workbook.created = new Date();

    // HOJA 1: Detalle de Ventas
    const ws1 = workbook.addWorksheet('Detalle de Ventas');
    ws1.columns = [
      { header: 'Fecha y Hora', key: 'fecha', width: 25 },
      { header: 'Total Venta', key: 'total', width: 20 },
      { header: 'Productos Vendidos', key: 'items', width: 60 },
    ];
    
    ws1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
    ws1.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    ventas.forEach(v => {
      const row = ws1.addRow({
        fecha: new Date(v.fechaCreacion).toLocaleString('es-CL'),
        total: Number(v.total) || 0, 
        items: v.items.map(i => `${i.cantidad} ${i.producto?.unidadMedida || ''} x ${i.producto?.nombre || 'Producto'}`).join(', ')
      });
      row.getCell(2).numFmt = '"$"#,##0'; 
      row.alignment = { vertical: 'middle' };
    });

    // HOJA 2: Ranking de Productos
    const ws2 = workbook.addWorksheet('Ranking Productos');
    ws2.columns = [
      { header: 'Posición', key: 'pos', width: 10 },
      { header: 'Producto', key: 'nombre', width: 30 },
      { header: 'Cantidad Vendida', key: 'cantidad', width: 20 },
      { header: 'Ingreso Total', key: 'ingreso', width: 20 },
      { header: 'Costo Total', key: 'costo', width: 20 },
      { header: 'Margen (Ganancia)', key: 'margen', width: 20 },
    ];

    ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
    ws2.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    ranking.forEach((r, i) => {
      const row = ws2.addRow({
        pos: i + 1,
        nombre: r.nombre,
        cantidad: r.cantidad,
        ingreso: r.ingreso,
        costo: r.costo,
        margen: r.margen
      });
      row.getCell(4).numFmt = '"$"#,##0';
      row.getCell(5).numFmt = '"$"#,##0';
      row.getCell(6).numFmt = '"$"#,##0';
      row.getCell(6).font = { color: { argb: 'FF22C55E' }, bold: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }
}