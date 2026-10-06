# Demo local sin Supabase

La demo usa PostgreSQL 17 en Docker. No requiere Supabase.

## Levantar
Desde la raíz:
```bash
docker compose up --build
```

El contenedor API espera a PostgreSQL, ejecuta `alembic upgrade head`, carga seeds idempotentes y levanta FastAPI.

## URLs
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Prueba del circuito
```bash
curl http://localhost:8000/health
curl http://localhost:8000/brands
curl http://localhost:8000/branches
```

Para probar menú se necesita el UUID de una sucursal y productos demo disponibles. Para crear pedidos se usa `POST /orders`.

## Reset completo de demo
```bash
docker compose down -v
docker compose up --build
```

Esto elimina únicamente el volumen PostgreSQL local de la demo.
