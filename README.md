# Che Restaurant Platform

Plataforma de ecommerce y operaciones gastronómicas para Che Bagels, Che Bakery y MET Café.

## Arquitectura
- `apps/web`: Next.js + TypeScript para ecommerce, Caja, Cocina/KDS, Delivery y Administración.
- `apps/api`: Python + FastAPI para reglas de negocio, pedidos, sucursales, pagos e integraciones.
- `database`: PostgreSQL y migraciones.
- `docs`: arquitectura y documentación funcional.

## Principios
- Mobile-first.
- Multi-marca y multi-sucursal.
- Compra sin registro obligatorio, con datos de entrega obligatorios.
- Backend como fuente de verdad para precios, disponibilidad, estados y pagos.
- Roles separados: admin, caja, cocina y delivery.
- Integraciones de pago desacopladas.

## Desarrollo local

### API
```bash
cd apps/api
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Health: `http://localhost:8000/health` · Docs: `http://localhost:8000/docs`

### Web
```bash
cd apps/web
npm install
npm run dev
```
Web: `http://localhost:3000`

## Estado
Fase 0: base técnica y arquitectura.
