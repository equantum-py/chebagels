import uuid
from decimal import Decimal
from unittest.mock import MagicMock
from app.models.core import Branch,OrderType,Product,ProductBranchAvailability
from app.schemas.orders import OrderCreate,OrderItemCreate
from app.services.orders import create_order

def test_create_order_uses_database_price():
    branch_id=uuid.uuid4(); product_id=uuid.uuid4()
    branch=Branch(id=branch_id,name="Demo",slug="demo",address="Demo",active=True)
    product=Product(id=product_id,brand_id=uuid.uuid4(),category_id=uuid.uuid4(),name="Bagel Demo",slug="bagel-demo",price=Decimal("45000"),active=True)
    availability=ProductBranchAvailability(product_id=product_id,branch_id=branch_id,available=True)
    db=MagicMock()
    db.get.side_effect=lambda model,key: branch if model is Branch else product
    db.scalar.return_value=availability
    payload=OrderCreate(branch_id=branch_id,order_type=OrderType.PICKUP,customer_name="Cliente Demo",customer_phone="0981000000",items=[OrderItemCreate(product_id=product_id,quantity=2)])
    order=create_order(db,payload)
    assert order.subtotal==Decimal("90000")
    assert order.total==Decimal("90000")
    assert order.status.value=="RECEIVED"
