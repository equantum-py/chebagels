from fastapi import APIRouter,HTTPException
from sqlalchemy import select\nfrom sqlalchemy.orm import joinedload
from app.db.session import SessionLocal
from app.models.core import Brand,Branch,Category,Product,ProductBranchAvailability,Order
from app.schemas.orders import OrderCreate
from app.services.orders import create_order,OrderValidationError

router=APIRouter(prefix="/api")

@router.get("/health",tags=["system"])
def health():
    return {"status":"ok","service":"che-api","version":"0.1.0"}

@router.get("/brands")
def brands():
    with SessionLocal() as db:
        rows=db.scalars(select(Brand).where(Brand.active.is_(True)).order_by(Brand.name)).all()
        return [{"id":str(x.id),"name":x.name,"slug":x.slug} for x in rows]

@router.get("/branches")
def branches():
    with SessionLocal() as db:
        rows=db.scalars(select(Branch).where(Branch.active.is_(True)).order_by(Branch.name)).all()
        return [{"id":str(x.id),"name":x.name,"slug":x.slug,"address":x.address} for x in rows]

@router.get("/menu")
def menu(branch_id:str):
    import uuid
    try: bid=uuid.UUID(branch_id)
    except ValueError: raise HTTPException(400,"branch_id inválido")
    with SessionLocal() as db:
        stmt=select(Product).options(joinedload(Product.category)).join(ProductBranchAvailability,ProductBranchAvailability.product_id==Product.id).join(Category,Category.id==Product.category_id).where(Product.active.is_(True),ProductBranchAvailability.branch_id==bid,ProductBranchAvailability.available.is_(True)).order_by(Category.sort_order,Product.name)
        rows=db.scalars(stmt).all()
        return [{"id":str(x.id),"brand_id":str(x.brand_id),"category_id":str(x.category_id),"category_name":x.category.name if x.category else None,"category_slug":x.category.slug if x.category else None,"name":x.name,"slug":x.slug,"description":x.description,"price":str(x.price),"image_url":x.image_url} for x in rows]

@router.post("/orders",status_code=201)
def post_order(payload:OrderCreate):
    with SessionLocal() as db:
        try:
            row=create_order(db,payload)
            return {"id":str(row.id),"order_number":row.order_number,"status":row.status.value,"order_type":row.order_type.value,"subtotal":str(row.subtotal),"delivery_fee":str(row.delivery_fee),"total":str(row.total)}
        except OrderValidationError as exc:
            db.rollback()
            raise HTTPException(422,str(exc))

@router.get("/orders/{order_number}")
def order(order_number:str):
    with SessionLocal() as db:
        row=db.scalar(select(Order).where(Order.order_number==order_number))
        if not row: raise HTTPException(404,"Pedido no encontrado")
        return {"id":str(row.id),"order_number":row.order_number,"status":row.status.value,"order_type":row.order_type.value,"total":str(row.total),"created_at":row.created_at}
