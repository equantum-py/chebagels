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
        categories={
            "calientes": get_or_create(db,Category,"bagels-calientes",brand_id=brands["che-bagels"].id,name="Bagels calientes",sort_order=1,active=True),
            "frios": get_or_create(db,Category,"bagels-frios",brand_id=brands["che-bagels"].id,name="Bagels fríos",sort_order=2,active=True),
            "tablas": get_or_create(db,Category,"tablas",brand_id=brands["che-bagels"].id,name="Armá tu tabla",sort_order=3,active=True),
            "papas": get_or_create(db,Category,"papas-fritas",brand_id=brands["che-bagels"].id,name="Papas fritas",sort_order=4,active=True),
            "ensaladas": get_or_create(db,Category,"ensaladas",brand_id=brands["che-bagels"].id,name="Ensaladas",sort_order=5,active=True),
            "bebidas": get_or_create(db,Category,"bebidas",brand_id=brands["che-bagels"].id,name="Bebidas",sort_order=6,active=True),
            "boxes": get_or_create(db,Category,"boxes",brand_id=brands["che-bagels"].id,name="Boxes",sort_order=7,active=True),
        }

        # Menú oficial cargado desde las cartas compartidas por CHE Bagels.
        # No inventamos productos ni precios fuera de esas cartas.
        products=[
            # Bagels calientes
            ("Desmechado Clásico","desmechado-clasico","Desmechado de carne, cebolla caramelizada, queso cheddar, queso crema y mayo casera.",45000,"calientes"),
            ("Desmechado de Costilla","desmechado-de-costilla","Desmechado de carne con morrones, chimichurri casero, queso provolone y mayo casera.",45000,"calientes"),
            ("Desmechado de Napolitano","desmechado-de-napolitano","Desmechado de carne, queso mozzarella, slice de tomates, orégano y mayo casera.",45000,"calientes"),
            ("American Burger","american-burger","Burger casera, pepinillos, queso cheddar, panceta, cebolla morada, mayo casera, kétchup y mostaza.",45000,"calientes"),
            ("Camarón al Ajillo","camaron-al-ajillo","Queso crema, base de rúcula, camarón, cebolla morada y mayo casera.",55000,"calientes"),
            ("Langostino Apanados","langostino-apanados","Base de crocantes de papas, langostino fritos y salsagolf.",55000,"calientes"),
            ("Crunchi de Pollo","crunchi-de-pollo","Crocantes de pollo, slice de tomate, mozzarella, palta, rúcula, mostaza tradicional y mayo casera.",45000,"calientes"),
            ("Mila Bagel","mila-bagel","Milanesa de lomo, queso mozzarella, mayo casera, tomate y lechuga repollada.",45000,"calientes"),
            ("BEC (Bacon, Egg and Cheese)","bec-bacon-egg-cheese","Huevos revueltos con panceta, queso cheddar, mayo casera y base de queso crema.",39000,"calientes"),
            # Bagels fríos
            ("Salmón Ahumado","salmon-ahumado","100gr salmón ahumado, queso crema, palta, tomate, cebolla morada, rúcula fresca, alcaparras y mayo casera.",70000,"frios"),
            ("Milano","milano","Salame Milán, queso mozzarella, rúcula, cebolla morada, slice de tomate, mayo casera y mostaza.",45000,"frios"),
            ("Paté de Pollo","pate-de-pollo","Pollo desmenuzado con queso crema y mostaza, lechuga repollada, slice de tomates y mayo casera.",45000,"frios"),
            ("Caprese","caprese","Slice de tomates, albahaca fresca, mozzarella, mayo ajo y pesto.",39000,"frios"),
            ("Queso Crema con Verdeo y Tomates","queso-crema-verdeo-tomates","",34000,"frios"),
            # Armá tu tabla
            ("Tabla Marina","tabla-marina","Vienen con 3 minis bagels: Salmón ahumado, Camarón al ajillo, Langostinos.",55000,"tablas"),
            ("Tabla Carnívora","tabla-carnivora","Vienen con 3 minis bagels: Desme clásico, Mila bagel, American burger.",50000,"tablas"),
            ("Tabla Desmechado","tabla-desmechado","Vienen con 3 minis bagels: Desme costilla, Desme clásico, Desme napolitano.",45000,"tablas"),
            ("Tabla Milanesitas","tabla-milanesitas","Vienen con 3 minis bagels: Mila con jamón y queso, Mila tradicional, Mila con cheddar y bacon.",45000,"tablas"),
            ("Tabla Exprés","tabla-expres","Vienen con 3 minis bagels: Caprese, Salame milán, Paté de pollo.",45000,"tablas"),
            ("Tabla Kids","tabla-kids","Vienen con 2 minis bagels: Jamón & queso sin mayonesa, Hamburguesa (pan - carne - queso).",30000,"tablas"),
            # Papas
            ("Papas Fritas Rústicas","papas-fritas-rusticas","",15000,"papas"),
            ("Papas Rústicas con Cheddar y Bacon","papas-rusticas-cheddar-bacon","",25000,"papas"),
            # Ensaladas
            ("Plato Salmón","plato-salmon","100gr salmón (salmón, huevo revuelto, rúcula, queso crema, lechuga repollada, alcaparras, semilla sésamo).",80000,"ensaladas"),
            ("Plato Camarón","plato-camaron","Camarón, rúcula, queso crema, cebolla morada, tomate.",60000,"ensaladas"),
            ("César de Pollo","cesar-de-pollo","Pollo grillado, croutones de bagels, mayo de la casa, lechuga repollada, queso sardo.",50000,"ensaladas"),
            # Boxes
            ("Box Premium","box-premium","15 Mini Bagels: 5 Paté de Pollo, 5 Desme de Costilla y 5 Jamón y Morrones.",130000,"boxes"),
            ("Box Mixto","box-mixto","15 Mini Bagels: 3 Salmón Ahumado, 3 Camarón al Ajillo, 3 Langostinos Apanados, 3 Burger y 3 Desmechados.",190000,"boxes"),
            ("Box Milanesita","box-milanesita","15 Mini Bagels: 5 Mila Tradicional, 5 Mila con Jamón y Queso y 5 Mila Caramelizada.",180000,"boxes"),
            ("Box Carnívoro","box-carnivoro","15 Mini Bagels: 5 Desmechado, 5 Burger y 5 Mila Bagel.",175000,"boxes"),
            ("Box Marino","box-marino","15 Mini Bagels: 5 Camarón al Ajillo, 5 Langostinos Apanados y 5 Salmón Ahumado.",175000,"boxes"),
            ("Box Pollo","box-pollo","15 Mini Bagels: Paté de Pollo, Crunchi de Pollo y Burger de Pollo.",140000,"boxes"),
            ("Box Hamburguesita","box-hamburguesita","15 Mini Bagels: 5 American Burger, 5 Burger Mozza y 5 Burger J&Q.",190000,"boxes"),
            ("Box Desmechado","box-desmechado","15 Mini Bagels: 5 Desmechado Clásico, 5 Desmechado Costilla y 5 Desmechado Napolitano.",190000,"boxes"),
            ("Box Express","box-express","9 Mini Bagels: 2 Desme Costilla, 3 Caprese, 2 Crunchi y 2 Paté de Pollo.",80000,"boxes"),
            ("Box 12 Mitades","box-12-mitades","12 unidades de bagels grandes: Desmechado Napolitano, Mila, Crunchi, Caprese, Paté de Pollo y Salame Milán.",150000,"boxes"),
            # Bebidas
            ("Gaseosa 500ml","gaseosa-500ml","Productos Coca-Cola.",10000,"bebidas"),
            ("Gaseosa 350ml","gaseosa-350ml","Productos Coca-Cola.",10000,"bebidas"),
            ("Gaseosa 250ml","gaseosa-250ml","Productos Coca-Cola.",8000,"bebidas"),
            ("Agua","agua","",8000,"bebidas"),
            ("Agua con Gas","agua-con-gas","",8000,"bebidas"),
        ]
        for name,slug,description,price,category_key in products:
            product=db.scalar(select(Product).where(Product.brand_id==brands["che-bagels"].id,Product.slug==slug))
            if not product:
                product=Product(id=uuid.uuid4(),brand_id=brands["che-bagels"].id,category_id=categories[category_key].id,name=name,slug=slug,description=description or None,price=Decimal(str(price)),active=True)
                db.add(product); db.flush()
            else:
                product.name=name
                product.category_id=categories[category_key].id
                product.description=description or None
                product.price=Decimal(str(price))
                product.active=True
            for branch in branches:
                if not db.get(ProductBranchAvailability,(product.id,branch.id)):
                    db.add(ProductBranchAvailability(product_id=product.id,branch_id=branch.id,available=True))
        db.commit()

if __name__=="__main__": run()
