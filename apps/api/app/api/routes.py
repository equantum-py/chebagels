from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.core import Brand, Branch, Category, Product, ProductBranchAvailability, Order, OrderItem, OrderStatus
from app.schemas.orders import OrderCreate, OrderStatusUpdate
from app.services.orders import create_order, OrderValidationError
from app.services.operations import change_order_status, list_branch_orders, OrderOperationError

router = APIRouter(prefix="/api")

@router.get("/health", tags=["system"])
def health():
    return {"status": "ok", "service": "che-api", "version": "0.1.0"}

@router.get("/brands")
def brands():
    with SessionLocal() as db:
        rows = db.scalars(select(Brand).where(Brand.active.is_(True)).order_by(Brand.name)).all()
        return [{"id": str(x.id), "name": x.name, "slug": x.slug} for x in rows]

@router.get("/branches")
def branches():
    with SessionLocal() as db:
        rows = db.scalars(select(Branch).where(Branch.active.is_(True)).order_by(Branch.name)).all()
        return [{"id": str(x.id), "name": x.name, "slug": x.slug, "address": x.address} for x in rows]

@router.get("/menu")
def menu(branch_id: str):
    import uuid
    try:
        bid = uuid.UUID(branch_id)
    except ValueError:
        raise HTTPException(400, "branch_id inválido")
    with SessionLocal() as db:
        stmt = (
            select(Product, Category.name, Category.slug)
            .join(ProductBranchAvailability, ProductBranchAvailability.product_id == Product.id)
            .join(Category, Category.id == Product.category_id)
            .where(
                Product.active.is_(True),
                ProductBranchAvailability.branch_id == bid,
                ProductBranchAvailability.available.is_(True),
            )
            .order_by(Category.sort_order, Product.name)
        )
        rows = db.execute(stmt).all()
        return [
            {
                "id": str(product.id),
                "brand_id": str(product.brand_id),
                "category_id": str(product.category_id),
                "category_name": category_name,
                "category_slug": category_slug,
                "name": product.name,
                "slug": product.slug,
                "description": product.description,
                "price": str(product.price),
                "image_url": product.image_url,
            }
            for product, category_name, category_slug in rows
        ]

@router.post("/orders", status_code=201)
def post_order(payload: OrderCreate):
    with SessionLocal() as db:
        try:
            row = create_order(db, payload)
            return {
                "id": str(row.id),
                "order_number": row.order_number,
                "status": row.status.value,
                "order_type": row.order_type.value,
                "subtotal": str(row.subtotal),
                "delivery_fee": str(row.delivery_fee),
                "total": str(row.total),
            }
        except OrderValidationError as exc:
            db.rollback()
            raise HTTPException(422, str(exc))

@router.get("/orders/{order_number}")
def order(order_number: str):
    with SessionLocal() as db:
        row = db.scalar(select(Order).where(Order.order_number == order_number))
        if not row:
            raise HTTPException(404, "Pedido no encontrado")
        return {
            "id": str(row.id),
            "order_number": row.order_number,
            "status": row.status.value,
            "order_type": row.order_type.value,
            "total": str(row.total),
            "created_at": row.created_at,
        }


@router.get("/operations/branches/{branch_id}/orders")
def operational_orders(branch_id: str, status: OrderStatus|None=None):
    import uuid
    try:
        bid=uuid.UUID(branch_id)
    except ValueError:
        raise HTTPException(400,"branch_id inválido")
    with SessionLocal() as db:
        rows=list_branch_orders(db,bid,status)
        result=[]
        for row in rows:
            items=db.scalars(select(OrderItem).where(OrderItem.order_id==row.id).order_by(OrderItem.parent_item_id.asc().nullsfirst(),OrderItem.product_name)).all()
            result.append({
                "id":str(row.id),
                "order_number":row.order_number,
                "branch_id":str(row.branch_id),
                "order_type":row.order_type.value,
                "status":row.status.value,
                "source":row.source,
                "total":str(row.total),
                "notes":row.notes,
                "created_at":row.created_at,
                "items":[{
                    "id":str(item.id),
                    "parent_item_id":str(item.parent_item_id) if item.parent_item_id else None,
                    "product_name":item.product_name,
                    "quantity":item.quantity,
                    "unit_price":str(item.unit_price),
                    "line_total":str(item.line_total),
                    "notes":item.notes,
                } for item in items],
            })
        return result

@router.patch("/operations/orders/{order_number}/status")
def operational_order_status(order_number: str,payload: OrderStatusUpdate):
    with SessionLocal() as db:
        row=db.scalar(select(Order).where(Order.order_number==order_number))
        if not row:
            raise HTTPException(404,"Pedido no encontrado")
        try:
            row=change_order_status(db,row,payload.status,payload.changed_by_user_id,payload.note)
        except OrderOperationError as exc:
            db.rollback()
            raise HTTPException(409,str(exc))
        return {
            "id":str(row.id),
            "order_number":row.order_number,
            "order_type":row.order_type.value,
            "status":row.status.value,
            "updated_at":row.updated_at,
        }
