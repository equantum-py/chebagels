import re
import uuid
from decimal import Decimal
from pydantic import BaseModel,Field,field_validator
from app.models.core import OrderType

class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int=Field(gt=0,le=50)
    notes: str|None=Field(default=None,max_length=500)

class DeliveryAddressCreate(BaseModel):
    address_line: str=Field(min_length=3,max_length=500)
    city: str|None=Field(default=None,max_length=120)
    zone: str|None=Field(default=None,max_length=120)
    reference: str|None=Field(default=None,max_length=500)
    latitude: Decimal|None=None
    longitude: Decimal|None=None

class OrderCreate(BaseModel):
    branch_id: uuid.UUID
    order_type: OrderType
    customer_name: str=Field(min_length=2,max_length=180)
    customer_phone: str=Field(min_length=5,max_length=40)
    customer_email: str|None=Field(default=None,max_length=255)
    address: DeliveryAddressCreate|None=None
    items: list[OrderItemCreate]=Field(min_length=1,max_length=50)
    notes: str|None=Field(default=None,max_length=1000)

    @field_validator("customer_phone")
    @classmethod
    def valid_phone(cls,value:str):
        digits=re.sub(r"\D","",value)
        if len(digits)<7 or len(digits)>15:
            raise ValueError("Teléfono inválido")
        return value.strip()

    @field_validator("customer_email")
    @classmethod
    def valid_email(cls,value:str|None):
        if value is None or value.strip()=="":
            return None
        value=value.strip()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+",value):
            raise ValueError("Email inválido")
        return value
