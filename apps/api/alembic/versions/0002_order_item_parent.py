"""order item parent relation

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
    op.add_column("order_items", sa.Column("parent_item_id", sa.UUID(), nullable=True))
    op.create_foreign_key("fk_order_items_parent_item_id", "order_items", "order_items", ["parent_item_id"], ["id"])
    op.create_index("ix_order_items_parent_item_id", "order_items", ["parent_item_id"], unique=False)

def downgrade():
    op.drop_index("ix_order_items_parent_item_id", table_name="order_items")
    op.drop_constraint("fk_order_items_parent_item_id", "order_items", type_="foreignkey")
    op.drop_column("order_items", "parent_item_id")
