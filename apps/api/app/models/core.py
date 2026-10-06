import enum, uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Boolean,DateTime,Enum,ForeignKey,Integer,Numeric,String,Text,UniqueConstraint,func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped,mapped_column
from app.db.base import Base

class OrderType(str,enum.Enum): DELIVERY="DELIVERY"; PICKUP="PICKUP"
class OrderStatus(str,enum.Enum): RECEIVED="RECEIVED"; CONFIRMED="CONFIRMED"; PREPARING="PREPARING"; READY="READY"; OUT_FOR_DELIVERY="OUT_FOR_DELIVERY"; DELIVERED="DELIVERED"; PICKED_UP="PICKED_UP"; CANCELLED="CANCELLED"
class PaymentStatus(str,enum.Enum): PENDING="PENDING"; PAID="PAID"; FAILED="FAILED"; REFUNDED="REFUNDED"; CANCELLED="CANCELLED"
class UserRole(str,enum.Enum): SUPER_ADMIN="SUPER_ADMIN"; ADMIN="ADMIN"; CASHIER="CASHIER"; KITCHEN="KITCHEN"; DELIVERY="DELIVERY"
class TimestampMixin:
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now())
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())
class Brand(TimestampMixin,Base):
    __tablename__="brands"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); name:Mapped[str]=mapped_column(String(120),unique=True); slug:Mapped[str]=mapped_column(String(120),unique=True); active:Mapped[bool]=mapped_column(Boolean,default=True)
class Branch(TimestampMixin,Base):
    __tablename__="branches"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); name:Mapped[str]=mapped_column(String(160)); slug:Mapped[str]=mapped_column(String(160),unique=True); address:Mapped[str]=mapped_column(Text); phone:Mapped[str|None]=mapped_column(String(40)); latitude:Mapped[Decimal|None]=mapped_column(Numeric(10,7)); longitude:Mapped[Decimal|None]=mapped_column(Numeric(10,7)); active:Mapped[bool]=mapped_column(Boolean,default=True)
class Category(TimestampMixin,Base):
    __tablename__="categories"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); brand_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("brands.id")); name:Mapped[str]=mapped_column(String(120)); slug:Mapped[str]=mapped_column(String(120)); sort_order:Mapped[int]=mapped_column(Integer,default=0); active:Mapped[bool]=mapped_column(Boolean,default=True); __table_args__=(UniqueConstraint("brand_id","slug"),)
class Product(TimestampMixin,Base):
    __tablename__="products"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); brand_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("brands.id")); category_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("categories.id")); name:Mapped[str]=mapped_column(String(180)); slug:Mapped[str]=mapped_column(String(180)); description:Mapped[str|None]=mapped_column(Text); price:Mapped[Decimal]=mapped_column(Numeric(12,2)); image_url:Mapped[str|None]=mapped_column(Text); active:Mapped[bool]=mapped_column(Boolean,default=True); __table_args__=(UniqueConstraint("brand_id","slug"),)
class ProductBranchAvailability(TimestampMixin,Base):
    __tablename__="product_branch_availability"; product_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("products.id"),primary_key=True); branch_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("branches.id"),primary_key=True); available:Mapped[bool]=mapped_column(Boolean,default=True)
class Customer(TimestampMixin,Base):
    __tablename__="customers"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); full_name:Mapped[str]=mapped_column(String(180)); phone:Mapped[str]=mapped_column(String(40),index=True); email:Mapped[str|None]=mapped_column(String(255),index=True)
class Address(TimestampMixin,Base):
    __tablename__="addresses"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); customer_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("customers.id")); address_line:Mapped[str]=mapped_column(Text); city:Mapped[str|None]=mapped_column(String(120)); zone:Mapped[str|None]=mapped_column(String(120)); reference:Mapped[str|None]=mapped_column(Text); latitude:Mapped[Decimal|None]=mapped_column(Numeric(10,7)); longitude:Mapped[Decimal|None]=mapped_column(Numeric(10,7))
class AppUser(TimestampMixin,Base):
    __tablename__="users"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); email:Mapped[str]=mapped_column(String(255),unique=True); full_name:Mapped[str]=mapped_column(String(180)); role:Mapped[UserRole]=mapped_column(Enum(UserRole,name="user_role")); branch_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("branches.id")); active:Mapped[bool]=mapped_column(Boolean,default=True)
class DeliveryZone(TimestampMixin,Base):
    __tablename__="delivery_zones"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); branch_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("branches.id")); name:Mapped[str]=mapped_column(String(120)); max_distance_km:Mapped[Decimal]=mapped_column(Numeric(6,2)); fee:Mapped[Decimal]=mapped_column(Numeric(12,2)); active:Mapped[bool]=mapped_column(Boolean,default=True)
class Order(TimestampMixin,Base):
    __tablename__="orders"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); order_number:Mapped[str]=mapped_column(String(32),unique=True,index=True); branch_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("branches.id")); customer_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("customers.id")); address_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("addresses.id")); order_type:Mapped[OrderType]=mapped_column(Enum(OrderType,name="order_type")); status:Mapped[OrderStatus]=mapped_column(Enum(OrderStatus,name="order_status"),default=OrderStatus.RECEIVED); source:Mapped[str]=mapped_column(String(40),default="WEB"); subtotal:Mapped[Decimal]=mapped_column(Numeric(12,2)); delivery_fee:Mapped[Decimal]=mapped_column(Numeric(12,2),default=0); total:Mapped[Decimal]=mapped_column(Numeric(12,2)); notes:Mapped[str|None]=mapped_column(Text)
class OrderItem(Base):
    __tablename__="order_items"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); order_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("orders.id")); product_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("products.id")); product_name:Mapped[str]=mapped_column(String(180)); quantity:Mapped[int]=mapped_column(Integer); unit_price:Mapped[Decimal]=mapped_column(Numeric(12,2)); line_total:Mapped[Decimal]=mapped_column(Numeric(12,2)); notes:Mapped[str|None]=mapped_column(Text)
class OrderStatusHistory(Base):
    __tablename__="order_status_history"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); order_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("orders.id")); status:Mapped[OrderStatus]=mapped_column(Enum(OrderStatus,name="order_status")); changed_by_user_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("users.id")); note:Mapped[str|None]=mapped_column(Text); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now())
class Payment(TimestampMixin,Base):
    __tablename__="payments"; id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4); order_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("orders.id")); provider:Mapped[str]=mapped_column(String(60)); method:Mapped[str]=mapped_column(String(60)); status:Mapped[PaymentStatus]=mapped_column(Enum(PaymentStatus,name="payment_status"),default=PaymentStatus.PENDING); amount:Mapped[Decimal]=mapped_column(Numeric(12,2)); external_reference:Mapped[str|None]=mapped_column(String(255),index=True)
