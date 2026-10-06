import uuid
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.core import Brand,Branch

BRANDS=[("Che Bagels","che-bagels"),("Che Bakery","che-bakery"),("MET Café","met-cafe")]
BRANCHES=[
    ("Sucursal 1","sucursal-1","Dirección pendiente de confirmación"),
    ("Sucursal 2","sucursal-2","Dirección pendiente de confirmación"),
]
def run():
    with SessionLocal() as db:
        for name,slug in BRANDS:
            if not db.scalar(select(Brand).where(Brand.slug==slug)):
                db.add(Brand(id=uuid.uuid4(),name=name,slug=slug,active=True))
        for name,slug,address in BRANCHES:
            if not db.scalar(select(Branch).where(Branch.slug==slug)):
                db.add(Branch(id=uuid.uuid4(),name=name,slug=slug,address=address,active=True))
        db.commit()
if __name__=="__main__": run()
