import uuid
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.core import Address,Branch,Customer,Order,OrderItem,OrderStatus,OrderStatusHistory,OrderType,Product,ProductBranchAvailability
from app.schemas.orders import OrderCreate

class OrderValidationError(ValueError): pass

def create_order(db:Session,data:OrderCreate)->Order:
    branch=db.get(Branch,data.branch_id)
    if not branch or not branch.active: raise OrderValidationError("Sucursal no disponible")
    if data.order_type==OrderType.DELIVERY and data.address is None: raise OrderValidationError("La dirección es obligatoria para delivery")
    customer=Customer(id=uuid.uuid4(),full_name=data.customer_name,phone=data.customer_phone,email=data.customer_email)
    db.add(customer); db.flush()
    address=None
    if data.order_type==OrderType.DELIVERY:
        a=data.address
        address=Address(id=uuid.uuid4(),customer_id=customer.id,address_line=a.address_line,city=a.city,zone=a.zone,reference=a.reference,latitude=a.latitude,longitude=a.longitude)
        db.add(address); db.flush()
    subtotal=Decimal("0")
    item_rows=[]
    for requested in data.items:
        product=db.get(Product,requested.product_id)
        availability=db.scalar(select(ProductBranchAvailability).where(ProductBranchAvailability.product_id==requested.product_id,ProductBranchAvailability.branch_id==data.branch_id))
        if not product or not product.active or not availability or not availability.available:
            raise OrderValidationError("Uno de los productos no está disponible en esta sucursal")
        line_total=product.price*requested.quantity
        subtotal+=line_total
        item_rows.append((product,requested,line_total))
    delivery_fee=Decimal("0")
    total=subtotal+delivery_fee
    order=Order(id=uuid.uuid4(),order_number=f"CH-{uuid.uuid4().hex[:8].upper()}",branch_id=data.branch_id,customer_id=customer.id,address_id=address.id if address else None,order_type=data.order_type,status=OrderStatus.RECEIVED,source="WEB",subtotal=subtotal,delivery_fee=delivery_fee,total=total,notes=data.notes)
    db.add(order); db.flush()
    item_ids={requested.client_line_key:uuid.uuid4() for _,requested,_ in item_rows if requested.client_line_key}
    for product,requested,line_total in item_rows:
        item_id=item_ids.get(requested.client_line_key,uuid.uuid4())
        parent_item_id=item_ids.get(requested.parent_line_key) if requested.parent_line_key else None
        if requested.parent_line_key and parent_item_id is None:
            raise OrderValidationError("La configuración del producto no es válida")
        db.add(OrderItem(id=item_id,order_id=order.id,parent_item_id=parent_item_id,product_id=product.id,product_name=product.name,quantity=requested.quantity,unit_price=product.price,line_total=line_total,notes=requested.notes))
    db.add(OrderStatusHistory(id=uuid.uuid4(),order_id=order.id,status=OrderStatus.RECEIVED,note="Pedido creado desde ecommerce"))
    db.commit(); db.refresh(order)
    return order
