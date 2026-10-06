import uuid
from decimal import Decimal
from pydantic import BaseModel,Field
from app.models.core import OrderType

class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int=Field(gt=0)
    notes: str|None=None

class DeliveryAddressCreate(BaseModel):
    address_line: str=Field(min_length=3,max_length=500)
    city: str|None=None
    zone: str|None=None
    reference: str|None=None
    latitude: Decimal|None=None
    longitude: Decimal|None=None

class OrderCreate(BaseModel):
    branch_id: uuid.UUID
    order_type: OrderType
    customer_name: str=Field(min_length=2,max_length=180)
    customer_phone: str=Field(min_length=5,max_length=40)
    customer_email: str|None=None
    address: DeliveryAddressCreate|None=None
    items: list[OrderItemCreate]=Field(min_length=1)
    notes: str|None=None
