"use client";
import {useEffect,useMemo,useState} from "react";
import "../home.css";
type Product={id:string;name:string;slug:string;description:string|null;price:string;image_url:string|null;category_name?:string|null;category_slug?:string|null};
const money=(v:string)=>"Gs. "+Number(v).toLocaleString("es-PY");
const ORDER=["bagels-calientes","bagels-frios","tablas","boxes","papas-fritas","ensaladas","bebidas"];
const images:Record<string,string>={"american-burger":"/images/products/bagel-burger.png","crunchi-de-pollo":"/images/products/bagel-crunch-pollo.png","desmechado-clasico":"/images/products/bagel-desmechado.png","bec-bacon-egg-cheese":"/images/products/bagel-huevo-panceta.png"};
export default function Menu(){
 const [items,setItems]=useState<Product[]>([]),[cart,setCart]=useState(0); const [mode,setMode]=useState("");
 useEffect(()=>{const b=localStorage.getItem("che_branch_id")||"";setMode(localStorage.getItem("che_order_type")||"DELIVERY");if(b)fetch("/api/menu?branch_id="+b).then(r=>r.json()).then(setItems)},[]);
 const cats=useMemo(()=>ORDER.map(slug=>({slug,name:items.find(x=>x.category_slug===slug)?.category_name||slug})).filter(c=>items.some(x=>x.category_slug===c.slug)),[items]);
 return <main className="store menuPage"><div className="promo">PEDÍ DIRECTO · DELIVERY Y RETIRO</div><header className="shopHeader"><a className="logo" href="/"><img src="/images/che-bagels-logo.png" alt="Che Bagels"/></a><nav><a className="menuBack" href="/">← Inicio</a><strong>{mode==="PICKUP"?"Retiro":"Delivery"}</strong></nav><button className="cartBtn">Mi pedido <b>{cart}</b></button></header>
 <section className="menuIntro"><span>MENÚ CHE BAGELS</span><h1>Elegí tu favorito.</h1><p>Todo el menú organizado por categoría.</p></section>
 <nav className="quickCats menuCats">{cats.map(c=><a href={"#"+c.slug} key={c.slug}>{c.name}</a>)}</nav>
 <section className="catalog fullCatalog">{cats.map(c=><section className="menuCategory" id={c.slug} key={c.slug}><div className="categoryHeading"><span>MENÚ CHE BAGELS</span><h2>{c.name}</h2></div><div className="cards">{items.filter(x=>x.category_slug===c.slug).map((x,i)=>{const src=x.image_url||images[x.slug];return <article className="foodCard" key={x.id}><div className={"foodPic pic"+i}>{src?<img src={src} alt={x.name}/>:<><span>CHE.</span><small>{c.name}</small></>}</div><div className="foodInfo"><h3>{x.name}</h3><p>{x.description||"Preparado al momento."}</p><div className="foodAction"><strong>{money(x.price)}</strong><button onClick={()=>setCart(n=>n+1)} aria-label={"Agregar "+x.name}>Agregar</button></div></div></article>})}</div></section>)}{!items.length&&<div className="emptyMenu">Cargando menú…</div>}</section>
 <footer className="shopFooter"><div className="logo footerLogo"><img src="/images/che-bagels-logo.png" alt="Che Bagels"/></div><p>Che Bagels · Che Bakery · MET Café</p><small>Delivery · Retiro · Pedí directo</small></footer>{cart>0&&<button className="floatingCart">Ver mi pedido <span>{cart} {cart===1?"producto":"productos"}</span> →</button>}</main>
}