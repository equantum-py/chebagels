from fastapi import FastAPI
from sqlalchemy import inspect, text
from app.api.routes import router
from app.db.session import engine

app = FastAPI(title="Che Restaurant Platform API", version="0.1.0")

def ensure_safe_schema_compatibility() -> None:
    """Apply small additive compatibility changes required by the running app.

    Full Alembic migrations remain the source of truth. This guard exists so a
    serverless deployment cannot accept checkout traffic with code that expects
    parent_item_id while the production database is one additive migration behind.
    """
    inspector = inspect(engine)
    if "order_items" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("order_items")}
    if "parent_item_id" in columns:
        return
    with engine.begin() as connection:
        connection.execute(text(
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS parent_item_id UUID REFERENCES order_items(id)"
        ))
        connection.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_order_items_parent_item_id ON order_items (parent_item_id)"
        ))

@app.on_event("startup")
def startup_schema_compatibility() -> None:
    ensure_safe_schema_compatibility()

app.include_router(router)
