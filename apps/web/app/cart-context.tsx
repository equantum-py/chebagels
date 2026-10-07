"use client";
import {createContext,useContext,useEffect,useMemo,useRef,useState} from "react";

export type CartProduct={id:string;name:string;slug:string;price:string;image_url?:string|null};
export type CartSelection={key:string;productId:string;label:string;price:number};
export type CartLine={key:string;product:CartProduct;quantity:number;selections:CartSelection[];notes?:string};
type CheckoutForm={name:string;phone:string;email:string;address:string;reference:string;notes:string};
type CartContextValue={lines:CartLine[];count:number;total:number;add:(product:CartProduct,selections?:CartSelection[],notes?:string,quantity?:number)=>void;decrease:(key:string)=>void;remove:(key:string)=>void;clear:()=>void;openCart:()=>void};

const CartContext=createContext<CartContextValue|null>(null);
const money=(v:number)=>"Gs. "+v.toLocaleString("es-PY");
const emptyForm:CheckoutForm={name:"",phone:"",email:"",address:"",reference:"",notes:""};
const errorText=(detail:unknown,fallback:string)=>{if(typeof detail==="string")return detail;if(Array.isArray(detail)){const first=detail[0] as {msg?:string}|undefined;return first?.msg?.replace(/^Value error,\s*/,"")||fallback}return fallback};
const selectionTotal=(line:CartLine)=>line.selections.reduce((n,x)=>n+x.price,0);
const lineUnit=(line:CartLine)=>Number(line.product.price)+selectionTotal(line);
const lineKey=(product:CartProduct,selections:CartSelection[],notes:string)=>product.id+"|"+selections.map(x=>x.key).sort().join(",")+"|"+notes.trim().toLowerCase();

export function CartProvider({children}:{children:React.ReactNode}){
 const [lines,setLines]=useState<CartLine[]>([]);
 const [ready,setReady]=useState(false),[open,setOpen]=useState(false),[checkout,setCheckout]=useState(false);
 const [form,setForm]=useState<CheckoutForm>(emptyForm),[submitting,setSubmitting]=useState(false),[error,setError]=useState(""),[orderNumber,setOrderNumber]=useState("");
 const [confirmedTotal,setConfirmedTotal]=useState<number|null>(null);
 const submittingRef=useRef(false),closeRef=useRef<HTMLButtonElement|null>(null),drawerRef=useRef<HTMLElement|null>(null),openerRef=useRef<HTMLElement|null>(null);

 useEffect(()=>{try{const raw=localStorage.getItem("che_cart");if(raw){const parsed=JSON.parse(raw);setLines((Array.isArray(parsed)?parsed:[]).map((x:any)=>{const selections=Array.isArray(x.selections)?x.selections.filter((s:any)=>typeof s?.productId==="string"):[];const notes=typeof x.notes==="string"?x.notes:"";return {...x,selections,notes,key:x.key||lineKey(x.product,selections,notes)}}))}}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("che_cart",JSON.stringify(lines))},[lines,ready]);
 useEffect(()=>{if(open)requestAnimationFrame(()=>closeRef.current?.focus())},[open]);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);return}if(e.key!=="Tab")return;const root=drawerRef.current;if(!root)return;const focusable=Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')).filter(el=>!el.hasAttribute("disabled"));if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};document.addEventListener("keydown",onKey);document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow="";requestAnimationFrame(()=>openerRef.current?.focus())}},[open]);

 const add=(product:CartProduct,selections:CartSelection[]=[],notes="",quantity=1)=>setLines(current=>{const key=lineKey(product,selections,notes);const found=current.find(x=>x.key===key);const safeQty=Math.max(1,Math.min(50,quantity));return found?current.map(x=>x.key===key?{...x,quantity:Math.min(50,x.quantity+safeQty)}:x):[...current,{key,product,quantity:safeQty,selections,notes}]});
 const decrease=(key:string)=>setLines(current=>current.flatMap(x=>x.key!==key?[x]:x.quantity>1?[{...x,quantity:x.quantity-1}]:[]));
 const remove=(key:string)=>setLines(current=>current.filter(x=>x.key!==key));
 const clear=()=>setLines([]);
 const count=lines.reduce((n,x)=>n+x.quantity,0);
 const total=lines.reduce((n,x)=>n+lineUnit(x)*x.quantity,0);

 const startCheckout=async()=>{setError("");setOrderNumber("");const branchId=localStorage.getItem("che_branch_id")||"";if(branchId){try{const fresh:CartProduct[]=await fetch("/api/menu?branch_id="+branchId).then(r=>r.json());const map=new Map(fresh.map(x=>[x.id,x]));const missing=lines.find(x=>!map.has(x.product.id));if(missing){setError(missing.product.name+" ya no está disponible en esta sucursal. Quitalo del pedido para continuar.");return}
   const missingExtra=lines.flatMap(x=>x.selections).find(s=>!map.has(s.productId));if(missingExtra){setError(missingExtra.label+" ya no está disponible en esta sucursal. Quitalo de la configuración para continuar.");return}
   setLines(current=>current.map(x=>({...x,product:{...x.product,price:map.get(x.product.id)!.price},selections:x.selections.map(s=>({...s,price:Number(map.get(s.productId)!.price)}))})))}catch{setError("No pudimos actualizar precios y disponibilidad. Intentá nuevamente.");return}}setCheckout(true)};
 const submitOrder=async(e:React.FormEvent)=>{e.preventDefault();setError("");if(submittingRef.current)return;const branchId=localStorage.getItem("che_branch_id")||"";const orderType=localStorage.getItem("che_order_type")==="PICKUP"?"PICKUP":"DELIVERY";
  if(!branchId){setError("Elegí una sucursal antes de finalizar.");return}if(form.name.trim().length<2){setError("Ingresá tu nombre.");return}if(!/^[0-9+() -]{7,20}$/.test(form.phone.trim())||form.phone.replace(/\D/g,"").length<7){setError("Ingresá un teléfono válido.");return}if(form.email.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())){setError("Ingresá un email válido.");return}if(orderType==="DELIVERY"&&form.address.trim().length<3){setError("Ingresá la dirección de entrega.");return}
  submittingRef.current=true;setSubmitting(true);try{const payload={branch_id:branchId,order_type:orderType,customer_name:form.name.trim(),customer_phone:form.phone.trim(),customer_email:form.email.trim()||null,address:orderType==="DELIVERY"?{address_line:form.address.trim(),reference:form.reference.trim()||null}:null,items:lines.flatMap((x,lineIndex)=>{
    const parentLineKey="L"+lineIndex;
    return [
     {product_id:x.product.id,quantity:x.quantity,notes:(x.notes||"").trim().slice(0,500)||null,client_line_key:parentLineKey},
     ...x.selections.map((s,selectionIndex)=>({product_id:s.productId,quantity:x.quantity,notes:"Agregado con "+x.product.name,client_line_key:parentLineKey+"-"+selectionIndex,parent_line_key:parentLineKey}))
    ];
   }),notes:form.notes.trim()||null};const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal:controller.signal});clearTimeout(timer);const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(errorText(data.detail,"No pudimos crear el pedido."));setOrderNumber(data.order_number||"Pedido recibido");setConfirmedTotal(Number(data.total));localStorage.setItem("che_last_order",JSON.stringify({order_number:data.order_number,total:data.total,order_type:data.order_type}));clear();setForm(emptyForm)}
  catch(err){const message=err instanceof Error?err.message:"";if((err instanceof DOMException&&err.name==="AbortError")||message.toLowerCase().includes("aborted"))setError("El pedido está tardando demasiado. Intentá nuevamente.");else if(err instanceof TypeError||message==="Failed to fetch")setError("No pudimos conectarnos. Revisá tu conexión e intentá nuevamente.");else setError(message||"No pudimos crear el pedido.")}
  finally{submittingRef.current=false;setSubmitting(false)}
 };
 const closeCart=()=>{setOpen(false);setCheckout(false);setError("");if(orderNumber)setOrderNumber("")};
 const value=useMemo(()=>({lines,count,total,add,decrease,remove,clear,openCart:()=>{openerRef.current=document.activeElement as HTMLElement;setCheckout(false);setError("");setOrderNumber("");setOpen(true)}}),[lines,count,total]);
 const orderType=typeof window!=="undefined"&&localStorage.getItem("che_order_type")==="PICKUP"?"PICKUP":"DELIVERY";

 return <CartContext.Provider value={value}>{children}{open&&<div className="cartOverlay" onMouseDown={closeCart}><aside ref={drawerRef} className="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" onMouseDown={e=>e.stopPropagation()}>
  <div className="cartDrawerHead"><div><span>{checkout?"FINALIZAR PEDIDO":"TU PEDIDO"}</span><h2 id="cart-title">{orderNumber?"Pedido recibido":checkout?"Tus datos":"Mi pedido"}</h2></div><button ref={closeRef} className="cartClose" onClick={closeCart} aria-label="Cerrar pedido">×</button></div>
  {orderNumber?<div className="orderSuccess"><b>✓</b><h3>¡Recibimos tu pedido!</h3><p>Tu número es <strong>{orderNumber}</strong>.</p>{confirmedTotal!==null&&<p>Total confirmado: <strong>{money(confirmedTotal)}</strong></p>}<p>El pedido quedó registrado y será confirmado por la sucursal.</p><button onClick={closeCart}>VOLVER AL MENÚ</button></div>
  :checkout?<form className="checkoutForm" onSubmit={submitOrder}><div className="checkoutMode"><span>{orderType==="PICKUP"?"Retiro en sucursal":"Delivery"}</span><button type="button" onClick={()=>setCheckout(false)}>Editar pedido</button></div>
    <label>Nombre y apellido<input required minLength={2} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoComplete="name"/></label><label>Teléfono<input required minLength={5} inputMode="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} autoComplete="tel" placeholder="Ej: 0981 123 456"/></label><label>Email <small>(opcional)</small><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} autoComplete="email"/></label>
    {orderType==="DELIVERY"&&<><label>Dirección de entrega<input required minLength={3} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} autoComplete="street-address"/></label><label>Referencia <small>(opcional)</small><input value={form.reference} onChange={e=>setForm({...form,reference:e.target.value})} placeholder="Casa, edificio, entre calles..."/></label></>}<label>Nota para el pedido <small>(opcional)</small><textarea rows={3} maxLength={1000} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
    <div className="checkoutTotal"><span>Total del pedido</span><strong>{money(total)}</strong></div>{error&&<p className="checkoutError" role="alert">{error}</p>}<button className="checkoutSubmit" type="submit" disabled={submitting}>{submitting?"ENVIANDO PEDIDO...":"CONFIRMAR PEDIDO"}</button><p className="checkoutNote">La sucursal confirmará disponibilidad y los siguientes pasos del pedido.</p></form>
  :!lines.length?<div className="cartEmpty">Todavía no agregaste productos.</div>
  :<>{error&&<p className="checkoutError cartAvailabilityError" role="alert">{error}</p>}<div className="cartBody"><div className="cartLines">{lines.map(line=><article className="cartLine" key={line.key}><div><h3>{line.product.name}</h3>{line.selections.length>0&&<ul className="cartModifiers">{line.selections.map(s=><li key={s.key}>{s.label}{s.price>0?" · +"+money(s.price):""}</li>)}</ul>}{line.notes&&<small className="cartLineNote">{line.notes}</small>}<strong>{money(lineUnit(line)*line.quantity)}</strong></div><div className="qtyControl"><button onClick={()=>decrease(line.key)} aria-label={"Quitar una unidad de "+line.product.name}>−</button><b>{line.quantity}</b><button onClick={()=>add(line.product,line.selections,line.notes||"")} aria-label={"Agregar una unidad de "+line.product.name}>+</button></div><button className="removeLine" onClick={()=>remove(line.key)}>Quitar</button></article>)}</div></div><div className="cartFooter"><div className="cartSummary"><span>{count} {count===1?"producto":"productos"}</span><strong>{money(total)}</strong></div><button className="checkoutSoon" onClick={startCheckout}>Finalizar pedido</button></div></>}
 </aside></div>}</CartContext.Provider>
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error("useCart debe usarse dentro de CartProvider");return value}
