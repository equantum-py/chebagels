from fastapi import APIRouter,HTTPException
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.core import Brand,Branch,Product,ProductBranchAvailability,Order

router=APIRouter()

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
def menu(branch_id: str):
    with SessionLocal() as db:
        try:
            import uuid
            bid=uuid.UUID(branch_id)
        except ValueError:
            raise HTTPException(400,"branch_id inválido")
        stmt=select(Product).join(ProductBranchAvailability,ProductBranchAvailability.product_id==Product.id).where(Product.active.is_(True),ProductBranchAvailability.branch_id==bid,ProductBranchAvailability.available.is_(True)).order_by(Product.name)
        rows=db.scalars(stmt).all()
        return [{"id":str(x.id),"brand_id":str(x.brand_id),"category_id":str(x.category_id),"name":x.name,"slug":x.slug,"description":x.description,"price":str(x.price),"image_url":x.image_url} for x in rows]

@router.get("/orders/{order_number}")
def order(order_number: str):
    with SessionLocal() as db:
        row=db.scalar(select(Order).where(Order.order_number==order_number))
        if not row: raise HTTPException(404,"Pedido no encontrado")
        return {"id":str(row.id),"order_number":row.order_number,"status":row.status.value,"order_type":row.order_type.value,"total":str(row.total),"created_at":row.created_at}
