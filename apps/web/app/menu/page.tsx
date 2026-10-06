"use client";
import {useEffect,useState} from "react";
import "../home.css";
type Product={id:string;name:string;description:string|null;price:string};
export default function Menu(){
 const [items,setItems]=useState<Product[]>([]); const [branch,setBranch]=useState(""); const [mode,setMode]=useState("");
 useEffect(()=>{const b=localStorage.getItem("che_branch_id")||"";setBranch(b);setMode(localStorage.getItem("che_order_type")||"");if(b)fetch("/api/menu?branch_id="+b).then(r=>r.json()).then(setItems)},[]);
 return <main className="menuPage"><header className="topbar"><div className="brandmark">CHE<span>.</span></div><a href="/" className="change">Cambiar sucursal</a></header><section className="menuHead"><div className="eyebrow">{mode==="PICKUP"?"RETIRO":"DELIVERY"}</div><h1>Nuestro menú</h1><p>Elegí lo que quieras. Los precios se validan directamente desde nuestra base.</p></section><section className="productGrid">{items.map(x=><article className="product" key={x.id}><div className="productPhoto">CHE.</div><div><h2>{x.name}</h2><p>{x.description||"Preparado al momento."}</p><strong>Gs. {Number(x.price).toLocaleString("es-PY")}</strong></div><button>+</button></article>)}{branch&&!items.length&&<p>Cargando menú…</p>}</section></main>
}