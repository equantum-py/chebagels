import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.core import Order,OrderStatus,OrderStatusHistory,OrderType

class OrderOperationError(ValueError): pass

ALLOWED_TRANSITIONS={
    OrderStatus.RECEIVED:{OrderStatus.CONFIRMED,OrderStatus.CANCELLED},
    OrderStatus.CONFIRMED:{OrderStatus.PREPARING,OrderStatus.CANCELLED},
    OrderStatus.PREPARING:{OrderStatus.READY,OrderStatus.CANCELLED},
    OrderStatus.READY:{OrderStatus.OUT_FOR_DELIVERY,OrderStatus.PICKED_UP,OrderStatus.CANCELLED},
    OrderStatus.OUT_FOR_DELIVERY:{OrderStatus.DELIVERED,OrderStatus.CANCELLED},
    OrderStatus.DELIVERED:set(),
    OrderStatus.PICKED_UP:set(),
    OrderStatus.CANCELLED:set(),
}

def list_branch_orders(db:Session,branch_id:uuid.UUID,status:OrderStatus|None=None)->list[Order]:
    stmt=select(Order).where(Order.branch_id==branch_id)
    if status is not None:
        stmt=stmt.where(Order.status==status)
    return list(db.scalars(stmt.order_by(Order.created_at.asc())).all())

def change_order_status(db:Session,order:Order,new_status:OrderStatus,changed_by_user_id:uuid.UUID|None=None,note:str|None=None)->Order:
    if new_status==order.status:
        return order
    allowed=ALLOWED_TRANSITIONS.get(order.status,set())
    if new_status not in allowed:
        raise OrderOperationError(f"No se puede cambiar de {order.status.value} a {new_status.value}")
    if order.status==OrderStatus.READY:
        if order.order_type==OrderType.PICKUP and new_status!=OrderStatus.PICKED_UP and new_status!=OrderStatus.CANCELLED:
            raise OrderOperationError("Un pedido para retiro debe pasar de LISTO a RETIRADO")
        if order.order_type==OrderType.DELIVERY and new_status!=OrderStatus.OUT_FOR_DELIVERY and new_status!=OrderStatus.CANCELLED:
            raise OrderOperationError("Un pedido delivery debe pasar de LISTO a EN CAMINO")
    order.status=new_status
    db.add(OrderStatusHistory(id=uuid.uuid4(),order_id=order.id,status=new_status,changed_by_user_id=changed_by_user_id,note=note))
    db.commit(); db.refresh(order)
    return order
