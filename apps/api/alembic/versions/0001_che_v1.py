"""Che database V1.

Revision ID: 0001_che_v1
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_che_v1"
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table("brands",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False, unique=True),
        sa.Column("slug", sa.String(120), nullable=False, unique=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.create_table("branches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("slug", sa.String(160), nullable=False, unique=True),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("phone", sa.String(40)),
        sa.Column("latitude", sa.Numeric(10,7)), sa.Column("longitude", sa.Numeric(10,7)),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.create_table("branch_hours",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("branches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("day_of_week", sa.SmallInteger(), nullable=False),
        sa.Column("opens_at", sa.Time()), sa.Column("closes_at", sa.Time()),
        sa.Column("is_closed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("delivery_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("pickup_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("branch_id","day_of_week"),
        sa.CheckConstraint("day_of_week BETWEEN 0 AND 6", name="ck_branch_hours_day"))
    op.create_table("categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("brand_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("brands.id",ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(120), nullable=False), sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("brand_id","slug"))
    op.create_table("products",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("brand_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("brands.id"), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("name", sa.String(180), nullable=False), sa.Column("slug", sa.String(180), nullable=False),
        sa.Column("description", sa.Text()), sa.Column("price", sa.Numeric(12,2), nullable=False),
        sa.Column("image_url", sa.Text()), sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("brand_id","slug"), sa.CheckConstraint("price >= 0",name="ck_products_price"))
    op.create_table("product_branch_availability",
        sa.Column("product_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("products.id",ondelete="CASCADE"),primary_key=True),
        sa.Column("branch_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("branches.id",ondelete="CASCADE"),primary_key=True),
        sa.Column("available",sa.Boolean(),nullable=False,server_default=sa.true()),
        sa.Column("created_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
        sa.Column("updated_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_table("customers",
        sa.Column("id",postgresql.UUID(as_uuid=True),primary_key=True), sa.Column("full_name",sa.String(180),nullable=False),
        sa.Column("phone",sa.String(40),nullable=False),sa.Column("email",sa.String(255)),
        sa.Column("created_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
        sa.Column("updated_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_index("ix_customers_phone","customers",["phone"])
    op.create_table("addresses",
        sa.Column("id",postgresql.UUID(as_uuid=True),primary_key=True),
        sa.Column("customer_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("customers.id",ondelete="CASCADE"),nullable=False),
        sa.Column("address_line",sa.Text(),nullable=False),sa.Column("city",sa.String(120)),sa.Column("zone",sa.String(120)),
        sa.Column("reference",sa.Text()),sa.Column("latitude",sa.Numeric(10,7)),sa.Column("longitude",sa.Numeric(10,7)),
        sa.Column("created_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
        sa.Column("updated_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    user_role=sa.Enum("SUPER_ADMIN","ADMIN","CASHIER","KITCHEN","DELIVERY",name="user_role")
    order_type=sa.Enum("DELIVERY","PICKUP",name="order_type")
    order_status=sa.Enum("RECEIVED","CONFIRMED","PREPARING","READY","OUT_FOR_DELIVERY","DELIVERED","PICKED_UP","CANCELLED",name="order_status")
    payment_status=sa.Enum("PENDING","PAID","FAILED","REFUNDED","CANCELLED",name="payment_status")
    op.create_table("users",
        sa.Column("id",postgresql.UUID(as_uuid=True),primary_key=True),sa.Column("email",sa.String(255),nullable=False,unique=True),
        sa.Column("full_name",sa.String(180),nullable=False),sa.Column("role",user_role,nullable=False),
        sa.Column("branch_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("branches.id")),
        sa.Column("active",sa.Boolean(),nullable=False,server_default=sa.true()),
        sa.Column("created_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
        sa.Column("updated_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_table("delivery_zones",
        sa.Column("id",postgresql.UUID(as_uuid=True),primary_key=True),
        sa.Column("branch_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("branches.id",ondelete="CASCADE"),nullable=False),
        sa.Column("name",sa.String(120),nullable=False),sa.Column("max_distance_km",sa.Numeric(6,2),nullable=False),
        sa.Column("fee",sa.Numeric(12,2),nullable=False),sa.Column("active",sa.Boolean(),nullable=False,server_default=sa.true()),
        sa.Column("created_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
        sa.Column("updated_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_table("orders",
        sa.Column("id",postgresql.UUID(as_uuid=True),primary_key=True),sa.Column("order_number",sa.String(32),nullable=False,unique=True),
        sa.Column("branch_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("branches.id"),nullable=False),
        sa.Column("customer_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("customers.id"),nullable=False),
        sa.Column("address_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("addresses.id")),
        sa.Column("order_type",order_type,nullable=False),sa.Column("status",order_status,nullable=False),
        sa.Column("source",sa.String(40),nullable=False,server_default="WEB"),
        sa.Column("subtotal",sa.Numeric(12,2),nullable=False),sa.Column("delivery_fee",sa.Numeric(12,2),nullable=False,server_default="0"),
        sa.Column("total",sa.Numeric(12,2),nullable=False),sa.Column("notes",sa.Text()),
        sa.Column("created_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
        sa.Column("updated_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_index("ix_orders_branch_status_created","orders",["branch_id","status","created_at"])
    op.create_table("order_items",
        sa.Column("id",postgresql.UUID(as_uuid=True),primary_key=True),
        sa.Column("order_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("orders.id",ondelete="CASCADE"),nullable=False),
        sa.Column("product_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("products.id",ondelete="SET NULL")),
        sa.Column("product_name",sa.String(180),nullable=False),sa.Column("quantity",sa.Integer(),nullable=False),
        sa.Column("unit_price",sa.Numeric(12,2),nullable=False),sa.Column("line_total",sa.Numeric(12,2),nullable=False),sa.Column("notes",sa.Text()))
    op.create_index("ix_order_items_order_id","order_items",["order_id"])
    op.create_table("order_status_history",
        sa.Column("id",postgresql.UUID(as_uuid=True),primary_key=True),
        sa.Column("order_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("orders.id",ondelete="CASCADE"),nullable=False),
        sa.Column("status",order_status,nullable=False),sa.Column("changed_by_user_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("users.id",ondelete="SET NULL")),
        sa.Column("note",sa.Text()),sa.Column("created_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_table("payments",
        sa.Column("id",postgresql.UUID(as_uuid=True),primary_key=True),
        sa.Column("order_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("orders.id",ondelete="CASCADE"),nullable=False),
        sa.Column("provider",sa.String(60),nullable=False),sa.Column("method",sa.String(60),nullable=False),
        sa.Column("status",payment_status,nullable=False),sa.Column("amount",sa.Numeric(12,2),nullable=False),
        sa.Column("external_reference",sa.String(255)),
        sa.Column("created_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
        sa.Column("updated_at",sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_index("ix_payments_order_status","payments",["order_id","status"])

def downgrade() -> None:
    for table in ("payments","order_status_history","order_items","orders","delivery_zones","users","addresses","customers","product_branch_availability","products","categories","branch_hours","branches","brands"):
        op.drop_table(table)
    for name in ("payment_status","order_status","order_type","user_role"):
        sa.Enum(name=name).drop(op.get_bind(),checkfirst=True)
