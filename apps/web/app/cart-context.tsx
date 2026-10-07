"use client";
import {createContext,useContext,useEffect,useMemo,useState} from "react";

export type CartProduct={id:string;name:string;slug:string;price:string;image_url?:string|null};
type CartLine={product:CartProduct;quantity:number};
type CartContextValue={lines:CartLine[];count:number;total:number;add:(product:CartProduct)=>void;clear:()=>void};

const CartContext=createContext<CartContextValue|null>(null);

export function CartProvider({children}:{children:React.ReactNode}){
 const [lines,setLines]=useState<CartLine[]>([]);
 const [ready,setReady]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem("che_cart");if(raw)setLines(JSON.parse(raw));}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("che_cart",JSON.stringify(lines))},[lines,ready]);
 const add=(product:CartProduct)=>setLines(current=>{const found=current.find(x=>x.product.id===product.id);return found?current.map(x=>x.product.id===product.id?{...x,quantity:x.quantity+1}:x):[...current,{product,quantity:1}]});
 const value=useMemo(()=>({lines,count:lines.reduce((n,x)=>n+x.quantity,0),total:lines.reduce((n,x)=>n+Number(x.product.price)*x.quantity,0),add,clear:()=>setLines([])}),[lines]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error("useCart debe usarse dentro de CartProvider");return value}
