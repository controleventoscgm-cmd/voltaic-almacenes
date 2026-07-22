import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // EXCEPCIÓN INFALIBLE: Si están creando un nuevo Almacén o buscando por nombre, los dejamos pasar sin ID.
    if ((req.method === 'POST' && req.path === '/api/v1/tenants') || 
        (req.method === 'GET' && req.path.startsWith('/api/v1/tenants/nombre/'))) {
      return next();
    }

    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      throw new BadRequestException('Falta el header X-Tenant-ID');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      throw new BadRequestException('El X-Tenant-ID no tiene un formato UUID válido');
    }

    (req as any).tenantId = tenantId;
    next();
  }
}