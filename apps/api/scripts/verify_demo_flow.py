import httpx

BASE="http://127.0.0.1:8000"

def ok(response):
    response.raise_for_status()
    return response.json()

health=ok(httpx.get(f"{BASE}/health"))
assert health["status"]=="ok"

brands=ok(httpx.get(f"{BASE}/brands"))
assert {"che-bagels","che-bakery","met-cafe"}.issubset({x["slug"] for x in brands})

branches=ok(httpx.get(f"{BASE}/branches"))
assert len(branches)>=2
branch=branches[0]

menu=ok(httpx.get(f"{BASE}/menu",params={"branch_id":branch["id"]}))
assert len(menu)>=1
product=menu[0]

payload={
    "branch_id":branch["id"],
    "order_type":"PICKUP",
    "customer_name":"Cliente Demo CI",
    "customer_phone":"0981000000",
    "items":[{"product_id":product["id"],"quantity":1}],
    "notes":"Pedido automático de verificación"
}
created=ok(httpx.post(f"{BASE}/orders",json=payload))
assert created["status"]=="RECEIVED"
assert created["order_number"].startswith("CH-")

stored=ok(httpx.get(f"{BASE}/orders/{created['order_number']}"))
assert stored["order_number"]==created["order_number"]
assert stored["status"]=="RECEIVED"

print("CHE DEMO FLOW OK")
print("brands:",len(brands),"branches:",len(branches),"menu:",len(menu),"order:",created["order_number"])
