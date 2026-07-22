import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para el frontend local
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-Tenant-ID'],
  });

  await app.listen(3001);
  console.log(`Aplicación corriendo en http://localhost:3001`);
}
bootstrap();