# Modelo de datos V1

Catálogo: brands -> categories -> products, con disponibilidad por sucursal en product_branch_availability.

Operación: branches y delivery_zones. Las tarifas quedan configurables.

Cliente: customers y addresses permiten checkout invitado; no se exige cuenta.

Pedidos: orders, order_items y order_status_history. Los items guardan snapshot de nombre/precio para conservar el histórico.

Pagos: payments admite distintos proveedores y métodos. Nunca se almacenan datos sensibles de tarjeta.

Personal: users con roles SUPER_ADMIN, ADMIN, CASHIER, KITCHEN y DELIVERY.

Decisiones: UUID internos; order_number humano CH-xxxx; Numeric para dinero; timestamps con zona horaria; disponibilidad por sucursal sin inventario de ingredientes en V1. Facturación electrónica queda fuera de esta fase.
