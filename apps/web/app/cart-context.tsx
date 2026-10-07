"use client";
import {createContext,useContext,useEffect,useMemo,useRef,useState} from "react";

export type CartProduct={id:string;name:string;slug:string;price:string;image_url?:string|null};
type CartLine={product:CartProduct;quantity:number};
type CartContextValue={lines:CartLine[];count:number;total:number;add:(product:CartProduct)=>void;decrease:(id:string)=>void;remove:(id:string)=>void;clear:()=>void;openCart:()=>void};

const CartContext=createContext<CartContextValue|null>(null);
const money=(v:number)=>"Gs. "+v.toLocaleString("es-PY");

export function CartProvider({children}:{children:React.ReactNode}){
 const [lines,setLines]=useState<CartLine[]>([]);
 const [ready,setReady]=useState(false);
 const [open,setOpen]=useState(false);
 const closeRef=useRef<HTMLButtonElement|null>(null);
 const drawerRef=useRef<HTMLElement|null>(null);
 const openerRef=useRef<HTMLElement|null>(null);
 useEffect(()=>{try{const raw=localStorage.getItem("che_cart");if(raw)setLines(JSON.parse(raw));}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("che_cart",JSON.stringify(lines))},[lines,ready]);
 useEffect(()=>{if(open)requestAnimationFrame(()=>closeRef.current?.focus())},[open]);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);return}if(e.key!=="Tab")return;const root=drawerRef.current;if(!root)return;const focusable=Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')).filter(el=>!el.hasAttribute("disabled"));if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};document.addEventListener("keydown",onKey);document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow="";requestAnimationFrame(()=>openerRef.current?.focus())}},[open]);
 const add=(product:CartProduct)=>setLines(current=>{const found=current.find(x=>x.product.id===product.id);return found?current.map(x=>x.product.id===product.id?{...x,quantity:x.quantity+1}:x):[...current,{product,quantity:1}]});
 const decrease=(id:string)=>setLines(current=>current.flatMap(x=>x.product.id!==id?[x]:x.quantity>1?[{...x,quantity:x.quantity-1}]:[]));
 const remove=(id:string)=>setLines(current=>current.filter(x=>x.product.id!==id));
 const count=lines.reduce((n,x)=>n+x.quantity,0),total=lines.reduce((n,x)=>n+Number(x.product.price)*x.quantity,0);
 const value=useMemo(()=>({lines,count,total,add,decrease,remove,clear:()=>setLines([]),openCart:()=>{openerRef.current=document.activeElement as HTMLElement;setOpen(true)}}),[lines,count,total]);
 return <CartContext.Provider value={value}>{children}{open&&<div className="cartOverlay" onMouseDown={()=>setOpen(false)}><aside ref={drawerRef} className="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" onMouseDown={e=>e.stopPropagation()}><div className="cartDrawerHead"><div><span>TU PEDIDO</span><h2 id="cart-title">Mi pedido</h2></div><button ref={closeRef} className="cartClose" onClick={()=>setOpen(false)} aria-label="Cerrar pedido">×</button></div>{!lines.length?<div className="cartEmpty">Todavía no agregaste productos.</div>:<><div className="cartBody"><div className="cartLines">{lines.map(line=><article className="cartLine" key={line.product.id}><div><h3>{line.product.name}</h3><strong>{money(Number(line.product.price)*line.quantity)}</strong></div><div className="qtyControl"><button onClick={()=>decrease(line.product.id)} aria-label={"Quitar una unidad de "+line.product.name}>−</button><b>{line.quantity}</b><button onClick={()=>add(line.product)} aria-label={"Agregar una unidad de "+line.product.name}>+</button></div><button className="removeLine" onClick={()=>remove(line.product.id)}>Quitar</button></article>)}</div></div><div className="cartFooter"><div className="cartSummary"><span>{count} {count===1?"producto":"productos"}</span><strong>{money(total)}</strong></div><button className="checkoutSoon" disabled>Finalizar pedido</button></div></>}</aside></div>}</CartContext.Provider>
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error("useCart debe usarse dentro de CartProvider");return value}
