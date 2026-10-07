"use client";
import {useEffect,useMemo,useState} from "react";
import {useCart} from "../cart-context";
type Product={id:string;name:string;slug:string;description:string|null;price:string;image_url:string|null;category_name?:string|null;category_slug?:string|null};
type Branch={id:string;name:string};
const money=(v:string|number)=>"Gs. "+Number(v).toLocaleString("es-PY");
const ORDER=["bagels-calientes","bagels-frios","tablas","boxes","papas-fritas","ensaladas","bebidas"];
const images:Record<string,string>={"american-burger":"/images/products/bagel-burger.png","crunchi-de-pollo":"/images/products/bagel-crunch-pollo.png","desmechado-clasico":"/images/products/bagel-desmechado.png","bec-bacon-egg-cheese":"/images/products/bagel-huevo-panceta.png"};
export default function Menu(){
 const [items,setItems]=useState<Product[]>([]),[mode,setMode]=useState("DELIVERY"),[loading,setLoading]=useState(true);
 const {count:cart,total,add}=useCart();
 useEffect(()=>{setMode(localStorage.getItem("che_order_type")||"DELIVERY");(async()=>{try{const branches:Branch[]=await fetch("/api/branches").then(r=>r.json());const saved=localStorage.getItem("che_branch_id");const branch=saved&&branches.some(x=>x.id===saved)?saved:(branches[0]?.id||"");if(branch){localStorage.setItem("che_branch_id",branch);const data=await fetch("/api/menu?branch_id="+branch).then(r=>r.json());setItems(data)}}finally{setLoading(false)}})()},[]);
 useEffect(()=>{if(!items.length)return;const id=decodeURIComponent(location.hash.slice(1));if(!id)return;requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}))},[items]);
 const cats=useMemo(()=>ORDER.map(slug=>({slug,name:items.find(x=>x.category_slug===slug)?.category_name||slug})).filter(c=>items.some(x=>x.category_slug===c.slug)),[items]);
 return <main className={cart>0?"store menuPage hasCart":"store menuPage"}><div className="promo">PEDÍ DIRECTO · DELIVERY Y RETIRO</div><header className="shopHeader"><a className="logo" href="/"><img src="/images/che-bagels-logo.png" alt="Che Bagels"/></a><nav><a className="menuBack" href="/">← Inicio</a><strong>{mode==="PICKUP"?"Retiro":"Delivery"}</strong></nav><button className="cartBtn">Mi pedido <b>{cart}</b></button></header>
 <section className="menuIntro"><span>MENÚ CHE BAGELS</span><h1>Elegí tu favorito.</h1><p>Todo el menú organizado por categoría.</p></section>
 <nav className="quickCats menuCats">{cats.map(c=><a href={"#"+c.slug} key={c.slug}>{c.name}</a>)}</nav>
 <section className="catalog fullCatalog">{cats.map(c=><section className="menuCategory" id={c.slug} key={c.slug}><div className="categoryHeading"><span>MENÚ CHE BAGELS</span><h2>{c.name}</h2></div><div className="cards">{items.filter(x=>x.category_slug===c.slug).map((x,i)=>{const src=x.image_url||images[x.slug];return <article className="foodCard" key={x.id}><div className={"foodPic pic"+i}>{src?<img loading="lazy" src={src} alt={x.name}/>:<><span>CHE.</span><small>{c.name}</small></>}</div><div className="foodInfo"><h3>{x.name}</h3>{x.description&&<p>{x.description}</p>}<div className="foodAction"><strong>{money(x.price)}</strong><button onClick={()=>add(x)} aria-label={"Agregar "+x.name}>Agregar</button></div></div></article>})}</div></section>)}{loading&&<div className="emptyMenu">Cargando menú…</div>}{!loading&&!items.length&&<div className="emptyMenu">No pudimos cargar el menú. Volvé a intentar.</div>}</section>
 <footer className="shopFooter"><div className="logo footerLogo"><img src="/images/che-bagels-logo.png" alt="Che Bagels"/></div><p>Che Bagels · Che Bakery · MET Café</p><small>Delivery · Retiro · Pedí directo</small></footer>{cart>0&&<button className="floatingCart"><b>Ver mi pedido</b><span>{cart} · {money(total)} →</span></button>}</main>
}