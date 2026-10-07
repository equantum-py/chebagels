"use client";
import {useEffect,useMemo,useState} from "react";

type Branch={id:string;name:string;slug:string;address:string};
type OrderItem={id:string;parent_item_id:string|null;product_name:string;quantity:number;unit_price:string;line_total:string;notes:string|null};
type Order={id:string;order_number:string;branch_id:string;order_type:"DELIVERY"|"PICKUP";status:string;source:string;total:string;notes:string|null;created_at:string;items:OrderItem[]};
const money=(v:string)=>"Gs. "+Number(v).toLocaleString("es-PY");
const time=(v:string)=>new Intl.DateTimeFormat("es-PY",{hour:"2-digit",minute:"2-digit"}).format(new Date(v));

export default function CajaPage(){
 const [branches,setBranches]=useState<Branch[]>([]),[branchId,setBranchId]=useState(""),[orders,setOrders]=useState<Order[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState("");
 useEffect(()=>{fetch("/api/branches").then(r=>r.json()).then((d:Branch[])=>{setBranches(d);const saved=localStorage.getItem("che_ops_branch_id");setBranchId(saved&&d.some(x=>x.id===saved)?saved:(d[0]?.id||""))}).catch(()=>setError("No pudimos cargar las sucursales."))},[]);
 const load=async()=>{if(!branchId)return;setLoading(true);setError("");try{const r=await fetch("/api/operations/branches/"+branchId+"/orders",{cache:"no-store"});if(!r.ok)throw new Error();setOrders(await r.json())}catch{setError("No pudimos cargar los pedidos de esta sucursal.")}finally{setLoading(false)}};
 useEffect(()=>{if(!branchId)return;localStorage.setItem("che_ops_branch_id",branchId);load();const id=setInterval(load,10000);return()=>clearInterval(id)},[branchId]);
 const selected=useMemo(()=>branches.find(x=>x.id===branchId),[branches,branchId]);
 const visible=orders.filter(x=>["RECEIVED","CONFIRMED"].includes(x.status));
 const confirm=async(order:Order)=>{setBusy(order.order_number);setError("");try{const r=await fetch("/api/operations/orders/"+order.order_number+"/status",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"CONFIRMED",note:"Confirmado desde Caja"})});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(typeof data.detail==="string"?data.detail:"No se pudo confirmar el pedido.");await load()}catch(e){setError(e instanceof Error?e.message:"No se pudo confirmar el pedido.")}finally{setBusy("")}};
 return <main className="opsPage">
  <header className="opsHeader"><div><span>CHE · OPERACIONES</span><h1>Caja</h1></div><div className="opsBranch"><label htmlFor="ops-branch">Sucursal</label><select id="ops-branch" value={branchId} onChange={e=>setBranchId(e.target.value)}>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div></header>
  <section className="opsToolbar"><div><b>{selected?.name||"Sucursal"}</b><small>Pedidos nuevos y confirmados</small></div><button onClick={load}>Actualizar</button></section>
  {error&&<p className="opsError" role="alert">{error}</p>}
  {loading?<div className="opsEmpty">Cargando pedidos...</div>:!visible.length?<div className="opsEmpty"><b>No hay pedidos pendientes.</b><span>La pantalla se actualiza automáticamente.</span></div>:<section className="opsGrid">{visible.map(order=>{const parents=order.items.filter(x=>!x.parent_item_id);return <article className={"opsOrder "+(order.status==="RECEIVED"?"isNew":"isConfirmed")} key={order.id}>
   <div className="opsOrderHead"><div><span>{order.status==="RECEIVED"?"NUEVO":"CONFIRMADO"}</span><h2>{order.order_number}</h2></div><time>{time(order.created_at)}</time></div>
   <div className="opsMeta"><b>{order.order_type==="DELIVERY"?"Delivery":"Retiro"}</b><span>{order.source}</span></div>
   <div className="opsItems">{parents.map(item=>{const extras=order.items.filter(x=>x.parent_item_id===item.id);return <div className="opsItem" key={item.id}><div><b>{item.quantity}× {item.product_name}</b>{item.notes&&<small>{item.notes}</small>}{extras.map(extra=><small className="opsExtra" key={extra.id}>+ {extra.quantity}× {extra.product_name}</small>)}</div><strong>{money(item.line_total)}</strong></div>})}</div>
   {order.notes&&<p className="opsNote"><b>Nota:</b> {order.notes}</p>}
   <div className="opsOrderFoot"><strong>{money(order.total)}</strong>{order.status==="RECEIVED"?<button disabled={busy===order.order_number} onClick={()=>confirm(order)}>{busy===order.order_number?"CONFIRMANDO...":"CONFIRMAR PEDIDO"}</button>:<span>Enviado a Cocina</span>}</div>
  </article>})}</section>}
 </main>
}