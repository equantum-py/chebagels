"""loyalty foundation, disabled by default

Revision ID: 0003_loyalty_foundation
Revises: 0002_order_item_parent
"""
from alembic import op
import sqlalchemy as sa

revision="0003_loyalty_foundation"
down_revision="0002_order_item_parent"
branch_labels=None
depends_on=None

def upgrade():
    op.create_table("loyalty_programs",
        sa.Column("id",sa.UUID(),primary_key=True),
        sa.Column("name",sa.String(120),nullable=False,unique=True),
        sa.Column("active",sa.Boolean(),nullable=False,server_default=sa.false()),
        sa.Column("guaranies_per_point",sa.Integer(),nullable=False,server_default="1000"),
        sa.Column("created_at",sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False),
        sa.Column("updated_at",sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False))
    op.create_table("loyalty_accounts",
        sa.Column("id",sa.UUID(),primary_key=True),
        sa.Column("customer_id",sa.UUID(),sa.ForeignKey("customers.id"),nullable=False,unique=True),
        sa.Column("program_id",sa.UUID(),sa.ForeignKey("loyalty_programs.id"),nullable=False),
        sa.Column("verified_at",sa.DateTime(timezone=True),nullable=True),
        sa.Column("created_at",sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False),
        sa.Column("updated_at",sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False))
    op.create_index("ix_loyalty_accounts_customer_id","loyalty_accounts",["customer_id"])
    op.create_table("loyalty_transactions",
        sa.Column("id",sa.UUID(),primary_key=True),
        sa.Column("account_id",sa.UUID(),sa.ForeignKey("loyalty_accounts.id"),nullable=False),
        sa.Column("order_id",sa.UUID(),sa.ForeignKey("orders.id"),nullable=True),
        sa.Column("points",sa.Integer(),nullable=False),
        sa.Column("event_key",sa.String(180),nullable=False,unique=True),
        sa.Column("reason",sa.String(40),nullable=False),
        sa.Column("created_at",sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False))
    op.create_index("ix_loyalty_transactions_account_id","loyalty_transactions",["account_id"])
    op.create_table("loyalty_rewards",
        sa.Column("id",sa.UUID(),primary_key=True),
        sa.Column("program_id",sa.UUID(),sa.ForeignKey("loyalty_programs.id"),nullable=False),
        sa.Column("title",sa.String(180),nullable=False),
        sa.Column("description",sa.Text(),nullable=True),
        sa.Column("points_cost",sa.Integer(),nullable=False),
        sa.Column("active",sa.Boolean(),nullable=False,server_default=sa.false()),
        sa.Column("created_at",sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False),
        sa.Column("updated_at",sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False))

def downgrade():
    op.drop_table("loyalty_rewards")
    op.drop_index("ix_loyalty_transactions_account_id",table_name="loyalty_transactions")
    op.drop_table("loyalty_transactions")
    op.drop_index("ix_loyalty_accounts_customer_id",table_name="loyalty_accounts")
    op.drop_table("loyalty_accounts")
    op.drop_table("loyalty_programs")
