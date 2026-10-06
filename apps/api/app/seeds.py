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

        # Los productos demo ya no se muestran en el ecommerce.
        demo_slugs=("bagel-demo-clasico","bagel-demo-premium")
        demo_rows=db.scalars(select(Product).where(Product.slug.in_(demo_slugs))).all()
        for demo in demo_rows:
            demo.active=False

        # Menú salado de Che Bagels. Bakery y MET Café se mantienen en sus secciones.
        products=[
            ("Jamón Serrano","jamon-serrano",Decimal("40000")),
            ("Salmón","salmon",Decimal("45000")),
            ("Mila","mila",Decimal("35000")),
            ("Desmechado","desmechado",Decimal("40000")),
            ("Pollo","pollo",Decimal("35000")),
            ("Crunch de Pollo","crunch-de-pollo",Decimal("40000")),
            ("Huevo y Panceta","huevo-y-panceta",Decimal("25000")),
            ("Burger","burger",Decimal("40000")),
        ]
        for name,slug,price in products:
            product=db.scalar(select(Product).where(Product.brand_id==brands["che-bagels"].id,Product.slug==slug))
            if not product:
                product=Product(
                    id=uuid.uuid4(),
                    brand_id=brands["che-bagels"].id,
                    category_id=category.id,
                    name=name,
                    slug=slug,
                    description="Bagel artesanal salado de Che Bagels.",
                    price=price,
                    active=True,
                )
                db.add(product); db.flush()
            else:
                product.name=name
                product.category_id=category.id
                product.price=price
                product.active=True
            for branch in branches:
                key={"product_id":product.id,"branch_id":branch.id}
                if not db.get(ProductBranchAvailability,(product.id,branch.id)):
                    db.add(ProductBranchAvailability(**key,available=True))
        db.commit()

if __name__=="__main__": run()
