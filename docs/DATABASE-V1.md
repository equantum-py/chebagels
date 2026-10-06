# Base de Datos V1

La V1 agrega horarios por sucursal, seeds iniciales y endpoints de lectura.

## Seeds
Se crean las marcas Che Bagels, Che Bakery y MET Café. Las dos sucursales se cargan como Sucursal 1 y Sucursal 2 con dirección pendiente, para no inventar datos no confirmados.

## Endpoints
GET /brands
GET /branches
GET /menu?branch_id=<uuid>
GET /orders/{order_number}

## Seguridad de pedidos
En esta etapa solo se expone lectura por número para desarrollo. Antes de producción el tracking público debe usar un token no predecible y no exponer datos personales.

## Próximo paso
Migración inicial completa, servicio transaccional POST /orders, estados válidos y autenticación/autorización de paneles.
