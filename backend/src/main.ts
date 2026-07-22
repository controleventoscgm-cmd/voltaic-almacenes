import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración CORS para permitir que Vercel hable con Render
  app.enableCors({
    origin: '*', // Permite cualquier dominio (Vercel)
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Tenant-ID'], // ¡Esta línea es la clave!
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  console.log(`Aplicación corriendo en el puerto ${PORT}`);
}
bootstrap();