"""CHE Club: deterministic ledger helpers; program remains disabled until launch."""
import uuid
from decimal import Decimal
from sqlalchemy import func,select
from sqlalchemy.orm import Session
from app.models.core import LoyaltyAccount,LoyaltyProgram,LoyaltyTransaction,Order,OrderStatus

def points_for_order(total:Decimal,guaranies_per_point:int)->int:
    if guaranies_per_point<=0:
        raise ValueError("La equivalencia debe ser positiva")
    return max(0,int(total//Decimal(guaranies_per_point)))

def account_balance(db:Session,account_id:uuid.UUID)->int:
    return int(db.scalar(select(func.coalesce(func.sum(LoyaltyTransaction.points),0)).where(LoyaltyTransaction.account_id==account_id)) or 0)

def award_completed_order(db:Session,order:Order,account:LoyaltyAccount,program:LoyaltyProgram)->int:
    """Call only from a trusted, authenticated server-side completion flow."""
    if not program.active or account.verified_at is None or account.program_id!=program.id:
        return 0
    if order.customer_id!=account.customer_id or order.source!="WEB":
        return 0
    if order.status not in {OrderStatus.DELIVERED,OrderStatus.PICKED_UP}:
        return 0
    key=f"order:{order.id}:earn"
    if db.scalar(select(LoyaltyTransaction.id).where(LoyaltyTransaction.event_key==key)):
        return 0
    points=points_for_order(order.total,program.guaranies_per_point)
    if points:
        db.add(LoyaltyTransaction(id=uuid.uuid4(),account_id=account.id,order_id=order.id,points=points,event_key=key,reason="ORDER_EARN"))
    return points
