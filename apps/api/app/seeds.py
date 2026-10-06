import uuid
from decimal import Decimal
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.core import Brand,Branch,Category,Product,ProductBranchAvailability

BRANDS=[("Che Bagels","che-bagels"),("Che Bakery","che-bakery"),("MET Café","met-cafe")]
BRANCHES=[("Sucursal 1","sucursal-1","Dirección pendiente de confirmación"),("Sucursal 2","sucursal-2","Dirección pendiente de confirmación")]

def get_or_create(db,model,slug,**values):
    row=db.scalar(select(model).where(model.slug==slug))
    if row: return row
    row=model(id=uuid.uuid4(),slug=slug,**values); db.add(row); db.flush(); return row

def run():
    with SessionLocal() as db:
        brands={slug:get_or_create(db,Brand,slug,name=name,active=True) for name,slug in BRANDS}
        branches=[get_or_create(db,Branch,slug,name=name,address=address,active=True) for name,slug,address in BRANCHES]
        category=get_or_create(db,Category,"bagels",brand_id=brands["che-bagels"].id,name="Bagels",sort_order=1,active=True)
        products=[
            ("Bagel Demo Clásico","bagel-demo-clasico",Decimal("35000")),
            ("Bagel Demo Premium","bagel-demo-premium",Decimal("45000")),
        ]
        for name,slug,price in products:
            product=db.scalar(select(Product).where(Product.brand_id==brands["che-bagels"].id,Product.slug==slug))
            if not product:
                product=Product(id=uuid.uuid4(),brand_id=brands["che-bagels"].id,category_id=category.id,name=name,slug=slug,description="Producto de demostración",price=price,active=True)
                db.add(product); db.flush()
            for branch in branches:
                key={"product_id":product.id,"branch_id":branch.id}
                if not db.get(ProductBranchAvailability,(product.id,branch.id)):
                    db.add(ProductBranchAvailability(**key,available=True))
        db.commit()

if __name__=="__main__": run()
