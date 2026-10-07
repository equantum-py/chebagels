"use client";
import {useEffect,useMemo,useState} from "react";
import {useCart} from "./cart-context";
type Branch={id:string;name:string;slug:string;address:string};
type Product={id:string;name:string;slug:string;description:string|null;price:string;image_url:string|null;category_name?:string|null;category_slug?:string|null};
type Mode="DELIVERY"|"PICKUP";
const money=(v:string)=>"Gs. "+Number(v).toLocaleString("es-PY");
const FEATURED_SLUGS=["american-burger","crunchi-de-pollo","desmechado-clasico","mila-bagel","bec-bacon-egg-cheese","salmon-ahumado","milano","pate-de-pollo"];
const SHARE_SLUGS=["box-premium","box-mixto","box-carnivoro","box-express","tabla-marina","tabla-carnivora","tabla-desmechado","tabla-milanesitas"];
const HOME_CATEGORIES=[
 {slug:"bagels-calientes",title:"Bagels calientes",limit:8},
 {slug:"bagels-frios",title:"Bagels fríos",limit:8},
 {slug:"papas-fritas",title:"Papas fritas",limit:4},
 {slug:"ensaladas",title:"Ensaladas",limit:4},
 {slug:"bebidas",title:"Bebidas",limit:4},
];
const localProductImages:Record<string,string>={
 "bagel-demo-clasico":"/images/products/bagel-clasico.png",
 "bagel-demo-premium":"/images/products/bagel-premium.png",
 "burger":"/images/products/bagel-burger.png",
 "crunch-de-pollo":"/images/products/bagel-crunch-pollo.png",
 "desmechado":"/images/products/bagel-desmechado.png",
 "huevo-y-panceta":"/images/products/bagel-huevo-panceta.png",
 "american-burger":"/images/products/bagel-burger.png",
 "crunchi-de-pollo":"/images/products/bagel-crunch-pollo.png",
 "desmechado-clasico":"/images/products/bagel-desmechado.png",
 "bec-bacon-egg-cheese":"/images/products/bagel-huevo-panceta.png",
};

export default function Home(){
 const [branches,setBranches]=useState<Branch[]>([]),[branchId,setBranchId]=useState(""),[mode,setMode]=useState<Mode>("DELIVERY");
 const [products,setProducts]=useState<Product[]>([]),[locationOpen,setLocationOpen]=useState(false),[activeCat,setActiveCat]=useState("menu");
 const {count:cart,total:cartTotal,add:addToCart}=useCart();
 const selected=useMemo(()=>branches.find(x=>x.id===branchId),[branches,branchId]);
 useEffect(()=>{fetch("/api/branches").then(r=>r.json()).then((d:Branch[])=>{setBranches(d);const saved=localStorage.getItem("che_branch_id");setBranchId(saved&&d.some(x=>x.id===saved)?saved:(d[0]?.id||""));});},[]);
 useEffect(()=>{if(branchId){localStorage.setItem("che_branch_id",branchId);localStorage.setItem("che_order_type",mode);fetch("/api/menu?branch_id="+branchId).then(r=>r.json()).then(setProducts);}},[branchId]);
 useEffect(()=>{const ids=["menu","home-boxes","home-bagels-calientes","home-bagels-frios","home-papas-fritas","home-ensaladas","home-bebidas"];const obs=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setActiveCat(visible.target.id)},{rootMargin:"-120px 0px -60% 0px",threshold:[0,.1,.3]});ids.forEach(id=>{const el=document.getElementById(id);if(el)obs.observe(el)});return()=>obs.disconnect()},[products]);
 return <main className={cart>0?"store hasCart":"store"}>
  <div className="promo">PEDÍ DIRECTO · DELIVERY Y RETIRO</div>
  <header className="shopHeader"><a className="logo" href="/" aria-label="Che Bagels"><img src="/images/che-bagels-logo.png" alt="Che Bagels"/></a><nav><button onClick={()=>setLocationOpen(true)}>⌖ <span>{selected?.name||"Elegí sucursal"}</span></button><div className="fulfillment"><button className={mode==="DELIVERY"?"on":""} onClick={()=>setMode("DELIVERY")}>Delivery</button><button className={mode==="PICKUP"?"on":""} onClick={()=>setMode("PICKUP")}>Retiro</button></div></nav><button className="cartBtn">Mi pedido <b>{cart}</b></button></header>
  <a className="staticHero" href="#menu" aria-label="Ver menú de Che Bagels"><picture><source media="(max-width: 760px)" srcSet="/images/banners/che-hero-mobile.png"/><img src="/images/banners/che-hero-desktop.png" alt="Che Bagels - Un poco de New York en Paraguay"/></picture></a>
  <section className="valueChips" aria-label="Por qué pedir en Che Bagels"><span>Bagels hechos a mano</span><span>Delivery o Retiro</span><span>Todo en un mismo pedido</span></section>
  <section className="quickCats" aria-label="Categorías"><a className={activeCat==="menu"?"active":""} href="#menu"><span>Más pedidos</span></a><a className={activeCat==="home-boxes"?"active":""} href="#home-boxes"><span>Para compartir</span></a><a className={activeCat==="home-bagels-calientes"?"active":""} href="#home-bagels-calientes"><span>Calientes</span></a><a className={activeCat==="home-bagels-frios"?"active":""} href="#home-bagels-frios"><span>Fríos</span></a><a className={activeCat==="home-papas-fritas"?"active":""} href="#home-papas-fritas"><span>Papas</span></a><a className={activeCat==="home-ensaladas"?"active":""} href="#home-ensaladas"><span>Ensaladas</span></a><a className={activeCat==="home-bebidas"?"active":""} href="#home-bebidas"><span>Bebidas</span></a></section>
  <section className="catalog homeCatalog" id="menu">
   {!products.length&&<div className="emptyMenu">Estamos preparando el menú de esta sucursal…</div>}
   {!!products.length&&<>
    <section className="homeCategory featuredSection"><div className="homeCategoryHead"><div><span>LOS FAVORITOS DE CHE</span><h2>Los más pedidos</h2><p>Si no sabés cuál elegir, empezá por acá.</p></div><a href="/menu">Ver menú completo →</a></div><div className="cards">{FEATURED_SLUGS.map(slug=>products.find(x=>x.slug===slug)).filter((x):x is Product=>Boolean(x)).map((x,i)=>{const imageSrc=x.image_url||localProductImages[x.slug]||null;return <article className="foodCard" key={x.id}><div className={"foodPic pic"+i}>{imageSrc?<img loading="lazy" src={imageSrc} alt={x.name}/>:<><span>CHE.</span><small>Favorito</small></>}</div><div className="foodInfo"><h3>{x.name}</h3><p>{x.description||""}</p><div className="foodAction"><strong>{money(x.price)}</strong><button onClick={()=>addToCart(x)} aria-label={"Agregar "+x.name}>Agregar</button></div></div></article>})}</div></section>
    <section className="homeCategory shareSection" id="home-boxes"><div className="homeCategoryHead"><div><span>PARA REUNIONES, OFICINA O AMIGOS</span><h2>Para compartir</h2><p>Boxes y tablas para resolver el pedido de todos.</p></div><a href="/menu#boxes">Ver Boxes y Tablas →</a></div><div className="cards">{SHARE_SLUGS.map(slug=>products.find(x=>x.slug===slug)).filter((x):x is Product=>Boolean(x)).map((x,i)=>{const imageSrc=x.image_url||localProductImages[x.slug]||null;return <article className="foodCard" key={x.id}><div className={"foodPic pic"+i}>{imageSrc?<img loading="lazy" src={imageSrc} alt={x.name}/>:<><span>CHE.</span><small>Para compartir</small></>}</div><div className="foodInfo"><h3>{x.name}</h3><p>{x.description||""}</p><div className="foodAction"><strong>{money(x.price)}</strong><button onClick={()=>addToCart(x)} aria-label={"Agregar "+x.name}>Agregar</button></div></div></article>})}</div></section>
    <div className="menuDivider"><span>SEGUÍ ELIGIENDO</span><h2>Menú por categoría</h2></div>
    {HOME_CATEGORIES.map(category=>{const items=products.filter(x=>x.category_slug===category.slug).slice(0,category.limit);if(!items.length)return null;return <section className="homeCategory compactCategory" id={"home-"+category.slug} key={category.slug}><div className="homeCategoryHead"><div><h2>{category.title}</h2></div><a href={"/menu#"+category.slug}>Ver todos →</a></div><div className="cards">{items.map((x,i)=>{const imageSrc=x.image_url||localProductImages[x.slug]||null;return <article className="foodCard" key={x.id}><div className={"foodPic pic"+i}>{imageSrc?<img loading="lazy" src={imageSrc} alt={x.name}/>:<><span>CHE.</span><small>{category.title}</small></>}</div><div className="foodInfo"><h3>{x.name}</h3>{x.description&&<p>{x.description}</p>}<div className="foodAction"><strong>{money(x.price)}</strong><button onClick={()=>addToCart(x)} aria-label={"Agregar "+x.name}>Agregar</button></div></div></article>})}</div></section>})}
    <a className="catalogMore" href="/menu">VER TODO EL MENÚ →</a>
   </>}
  </section>
  <section className="brandCrossSell"><div className="crossSellHead"><span>CHE BAKERY · MET CAFÉ</span><h2>Algo rico para completar.</h2><p>Muy pronto vas a poder sumar Bakery y Café al mismo pedido.</p></div><div className="brandBands"><div className="brandBanner"><picture><source media="(max-width: 760px)" srcSet="/images/banners/che-bakery-mobile.png"/><img loading="lazy" src="/images/banners/che-bakery-desktop.png" alt="Che Bakery"/></picture></div><div className="brandBanner"><picture><source media="(max-width: 760px)" srcSet="/images/banners/met-cafe-mobile.png"/><img loading="lazy" src="/images/banners/met-cafe-desktop.png" alt="MET Café"/></picture></div></div></section>
  <footer className="shopFooter"><div className="logo footerLogo"><img src="/images/che-bagels-logo.png" alt="Che Bagels"/></div><p>Che Bagels · Che Bakery · MET Café</p><small>Delivery · Retiro · Pedí directo</small></footer>
  {cart>0&&<button className="floatingCart"><b>Ver mi pedido</b><span>{cart} · {money(String(cartTotal))} →</span></button>}
  {locationOpen&&<div className="modalBack" onClick={()=>setLocationOpen(false)}><section className="locationModal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setLocationOpen(false)}>×</button><span className="modalKicker">TU PEDIDO</span><h2>¿Dónde estás?</h2><p>Elegí la sucursal y cómo querés recibir tu pedido.</p><div className="modalModes"><button className={mode==="DELIVERY"?"active":""} onClick={()=>setMode("DELIVERY")}>Delivery</button><button className={mode==="PICKUP"?"active":""} onClick={()=>setMode("PICKUP")}>Retiro</button></div><div className="modalBranches">{branches.map(b=><button className={b.id===branchId?"active":""} key={b.id} onClick={()=>setBranchId(b.id)}><span><b>{b.name}</b><small>{b.address}</small></span><i>{b.id===branchId?"✓":""}</i></button>)}</div><button className="modalDone" onClick={()=>setLocationOpen(false)}>LISTO, VER MENÚ</button></section></div>}
 </main>
}