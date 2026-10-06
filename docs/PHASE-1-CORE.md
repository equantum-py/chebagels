# Fase 1 — Núcleo de Che

## Implementado
- Configuración central por variables de entorno.
- SQLAlchemy 2.
- PostgreSQL como base transaccional.
- Alembic preparado para migraciones.
- Catálogo multi-marca.
- Sucursales.
- Disponibilidad de productos por sucursal.
- Checkout invitado mediante customers + addresses.
- Pedidos y detalle de pedidos.
- Historial auditable de estados.
- Pagos desacoplados del proveedor.
- Zonas/tarifas de delivery.
- Usuarios internos y roles.

## Roles
SUPER_ADMIN, ADMIN, CASHIER, KITCHEN, DELIVERY.

## Estados
Delivery: RECEIVED -> CONFIRMED -> PREPARING -> READY -> OUT_FOR_DELIVERY -> DELIVERED.
Retiro: RECEIVED -> CONFIRMED -> PREPARING -> READY -> PICKED_UP.
CANCELLED se conserva como estado terminal auditable.

## Próximo bloque
Crear la primera migración real, constraints/índices finales, seed inicial de marcas/sucursales y servicios/repositorios de dominio antes de exponer CRUD público.
