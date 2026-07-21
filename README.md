⚡ Voltaic Almacenes
SaaS POS Multi-Tenant con IA para Almacenes y Minimarkets

Plataforma de punto de venta e inventario diseñada específicamente para la realidad de los pequeños almacenes en Chile. Automatiza ventas, compras y gestión de stock mediante Inteligencia Artificial, con un enfoque estricto en privacidad y cumplimiento de la normativa chilena (Ley 21.719).

🚀 Características Principales
Arquitectura Multi-Tenant: Aislamiento de datos por almacén mediante Middleware y UUIDs.
Punto de Venta (POS) Rápido: Escaneo por código de barras, cobro en efectivo (con cálculo de vuelto) e integración con POS físico de Transbank.
Copiloto IA de Ventas: Registro de ventas en lenguaje natural (ej. "vendí 2 cocas y un pan") usando DeepSeek.
Lector de Facturas IA: Extracción de productos, costos y unidades de medida desde una foto de factura física usando Google Gemini. Crea productos faltantes automáticamente y sugiere márgenes de venta.
Gestión de Inventario: Soporte para unidades de medida (unidad, kg, gr, lt) y decimales (venta por peso). Alertas dinámicas de bajo stock en el Dashboard.
Reportes y Analytics: Detalle de ventas por fecha, ranking de productos más vendidos, cálculo de márgenes de ganancia y exportación a Excel (.xlsx) con formato profesional.
Automatización: Respaldos de base de datos programables y envío de reportes diarios a Telegram.
🛠️ Stack Tecnológico
Backend: NestJS (TypeScript) - Arquitectura Hexagonal Light.
Base de Datos: PostgreSQL (Producción) / SQLite (Desarrollo local). Gestionado con TypeORM.
IA: DeepSeek API (Texto) y Google Gemini API (Visión).
Frontend (Actual): HTML5, CSS3, Vanilla JS (SPA).
Frontend (Futuro): Flutter (App Móvil nativa iOS/Android).
📋 Requisitos Previos
Node.js (v18 o superior)
npm o yarn
API Keys de DeepSeek y/o Google Gemini (Opcional, solo para funciones de IA)
🔧 Instalación y Ejecución
Configurar el Backend:
Abre tu terminal y ejecuta:
cd backend
npm install
Configurar variables de entorno:
Crea un archivo .env en la carpeta backend basado en .env.example y completa tus credenciales:
DB_TYPE=sqlite
DB_DATABASE=voltaic.sqlite
IA_API_KEY=sk-tu-api-key-deepseek
IA_BASE_URL=https://api.deepseek.com/v1
IA_MODEL=deepseek-chat
TELEGRAM_BOT_TOKEN=tu-token
TELEGRAM_CHAT_ID=tu-chat-id
Levantar el servidor:
npm run start:dev
El backend estará corriendo en http://localhost:3001
Abrir el Frontend:
Ve a la carpeta frontend.
Abre el archivo index.html en tu navegador preferido (Google Chrome recomendado).
Crea un nuevo Almacén (Tenant) y comienza a probar el sistema.
📂 Estructura del Proyecto
voltaic-almacenes/
├── backend/
│ ├── src/
│ │ ├── context/ # Módulos de dominio (Hexagonal Light)
│ │ │ ├── analytics/ # Dashboard y Reportes Excel
│ │ │ ├── compras/ # Órdenes de compra y proveedores
│ │ │ ├── ia/ # Integración DeepSeek y Gemini
│ │ │ ├── inventario/ # Productos, stock y movimientos
│ │ │ ├── reportes/ # Backups y Telegram Scheduler
│ │ │ ├── tenant/ # Multi-Tenancy y configuración
│ │ │ ├── transbank/ # Integración POS Transbank
│ │ │ └── ventas/ # Tickets y Punto de Venta
│ │ ├── app.module.ts
│ │ └── main.ts
│ ├── .env
│ └── package.json
├── frontend/
│ └── index.html # Aplicación web SPA (Dashboard, POS, Reportes)
└── README.md

⚖️ Cumplimiento Legal (Chile)
Ley 21.719 (Protección de Datos): No se solicitan datos personales para ventas de mostrador (Boleta VIP). Minimización de datos estricta.
SII (Servicio de Impuestos Internos): Desglose automático de IVA (19%) en recibos y reportes para declaraciones.
Desarrollado por VoltaicTech SpA.