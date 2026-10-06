# Arquitectura — Che Restaurant Platform

Una tienda para Che Bagels, Che Bakery y MET Café, preparada para múltiples sucursales.

## Interfaces
Ecommerce cliente, Caja, Cocina/KDS, Delivery y Administración. Todas consumen una API central.

## Backend
FastAPI controla sucursales/horarios, disponibilidad, precios, pedidos, estados, pagos y autorización por roles.

## Frontend
Next.js entrega web y PWA. No es fuente de verdad para precios, pagos ni estados.

## Datos
PostgreSQL, multi-marca y multi-sucursal.

## Estados
Delivery: RECEIVED -> CONFIRMED -> PREPARING -> READY -> OUT_FOR_DELIVERY -> DELIVERED.
Retiro: RECEIVED -> CONFIRMED -> PREPARING -> READY -> PICKED_UP.

## Seguridad
Secretos solo en backend, variables de entorno fuera del repo, autorización por rol, validación server-side, auditoría y webhooks de pago verificados.

## Integraciones
Bancard, PagoPar, ueno y canales externos mediante adaptadores separados.
