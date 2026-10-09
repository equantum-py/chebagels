"""Idempotent order item parent migration (startup compatibility guard may have added column).

Revision ID: 0002_order_item_parent
Revises: 0001_che_v1
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_order_item_parent"
down_revision = "0001_che_v1"
branch_labels = None
depends_on = None

def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("order_items")}
    if "parent_item_id" not in columns:
        op.add_column("order_items", sa.Column("parent_item_id", sa.UUID(), nullable=True))
    inspector = sa.inspect(bind)
    fks = inspector.get_foreign_keys("order_items")
    has_parent_fk = any(fk.get("constrained_columns") == ["parent_item_id"] and fk.get("referred_table") == "order_items" for fk in fks)
    if not has_parent_fk:
        op.create_foreign_key("fk_order_items_parent_item_id", "order_items", "order_items", ["parent_item_id"], ["id"])
    indexes = {idx["name"] for idx in inspector.get_indexes("order_items")}
    if "ix_order_items_parent_item_id" not in indexes:
        op.create_index("ix_order_items_parent_item_id", "order_items", ["parent_item_id"], unique=False)

def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    indexes = {idx["name"] for idx in inspector.get_indexes("order_items")}
    if "ix_order_items_parent_item_id" in indexes:
        op.drop_index("ix_order_items_parent_item_id", table_name="order_items")
    for fk in inspector.get_foreign_keys("order_items"):
        if fk.get("constrained_columns") == ["parent_item_id"] and fk.get("referred_table") == "order_items":
            op.drop_constraint(fk["name"], "order_items", type_="foreignkey")
    columns = {col["name"] for col in sa.inspect(bind).get_columns("order_items")}
    if "parent_item_id" in columns:
        op.drop_column("order_items", "parent_item_id")
