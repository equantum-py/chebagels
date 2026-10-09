"use client";
import {pointsLabel} from "./club-points";
import {useEffect,useMemo,useRef,useState} from "react";
import {useCart} from "./cart-context";
type Branch={id:string;name:string;slug:string;address:string};
const branchDisplay=(branch:Branch):Branch=>{
 const details:Record<string,{name:string;address:string}>={
  "sucursal-1":{name:"Recoleta",address:"Teniente Zotti, Asunción"},
  "sucursal-2":{name:"Las Lomas",address:"PCGC+28M, Asunción"},
  "ciudad-del-este":{name:"Ciudad del Este",address:"F9GG+CXP, Ciudad del Este"},
  "san-vicente":{name:"San Vicente",address:"San Vicente, Asunción · dirección exacta pendiente"}
 };
 return {...branch,...(details[branch.slug]||{})};
};
const plannedBranches=[{name:"Ciudad del Este",address:"F9GG+CXP, Ciudad del Este",slug:"ciudad-del-este"},{name:"San Vicente",address:"San Vicente, Asunción · dirección exacta pendiente",slug:"san-vicente"}];

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

const assetFallback=(event:React.SyntheticEvent<HTMLImageElement>)=>{const img=event.currentTarget;if(img.dataset.fallback==="1"){img.style.display="none";return;}const original=img.dataset.originalPath||new URL(img.src).pathname;if(!original.startsWith("/images/")){img.style.display="none";return;}img.dataset.fallback="1";img.dataset.originalPath=original;const picture=img.closest("picture");picture?.querySelectorAll("source").forEach(source=>source.remove());img.src="https://raw.githubusercontent.com/equantum-py/chebagels/feat/che-club-review/apps/web/public"+original;};
export default function Home(){
 const [branches,setBranches]=useState<Branch[]>([]),[branchId,setBranchId]=useState(""),[mode,setMode]=useState<Mode>("DELIVERY"),[modeReady,setModeReady]=useState(false);
 const [products,setProducts]=useState<Product[]>([]),[menuLoading,setMenuLoading]=useState(true),[locationOpen,setLocationOpen]=useState(false),[activeCat,setActiveCat]=useState("menu");
 const {count:cart,total:cartTotal,add:addToCart,openCart}=useCart();
 const catBarRef=useRef<HTMLElement|null>(null),locationCloseRef=useRef<HTMLButtonElement|null>(null);
 const selected=useMemo(()=>branches.find(x=>x.id===branchId),[branches,branchId]);
 useEffect(()=>{const sync=()=>{const savedMode=localStorage.getItem("che_order_type");setMode(savedMode==="PICKUP"?"PICKUP":"DELIVERY");setBranchId(localStorage.getItem("che_branch_id")||"")};sync();setModeReady(true);window.addEventListener("che:location-change",sync);return()=>window.removeEventListener("che:location-change",sync)},[]);
 useEffect(()=>{fetch("/api/branches").then(r=>r.json()).then((d:Branch[])=>{setBranches(d.map(branchDisplay));const saved=localStorage.getItem("che_branch_id");setBranchId(saved&&d.some(x=>x.id===saved)?saved:(d[0]?.id||""));});},[]);
 useEffect(()=>{if(branchId){localStorage.setItem("che_branch_id",branchId);setMenuLoading(true);fetch("/api/menu?branch_id="+branchId).then(r=>r.json()).then(setProducts).finally(()=>setMenuLoading(false));}},[branchId]);
 useEffect(()=>{if(modeReady)localStorage.setItem("che_order_type",mode)},[mode,modeReady]);
 useEffect(()=>{const active=catBarRef.current?.querySelector<HTMLAnchorElement>(`a[href="#${activeCat}"]`);active?.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"})},[activeCat]);
 useEffect(()=>{if(!locationOpen)return;locationCloseRef.current?.focus();const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setLocationOpen(false)};document.addEventListener("keydown",onKey);return()=>document.removeEventListener("keydown",onKey)},[locationOpen]);
 useEffect(()=>{const ids=["menu","home-boxes","home-bagels-calientes","home-bagels-frios","home-papas-fritas","home-ensaladas","home-bebidas"];const update=()=>{const y=window.scrollY+150;if(window.scrollY<Math.max(80,(document.getElementById("menu")?.offsetTop||0)-150)){setActiveCat("menu");return}let current="menu";for(const id of ids){const el=document.getElementById(id);if(el&&el.offsetTop<=y)current=id}if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-40)current=ids[ids.length-1];setActiveCat(current)};update();window.addEventListener("scroll",update,{passive:true});return()=>window.removeEventListener("scroll",update)},[products]);
 return <main className={cart>0?"store hasCart":"store"}>
  
  
  <a className="staticHero" href="#menu" aria-label="Ver menú de Che Bagels"><picture><source media="(max-width: 760px)" srcSet="/images/banners/che-hero-mobile.png"/><img onError={assetFallback} src="/images/banners/che-hero-desktop.png" alt="Che Bagels - Un poco de New York en Paraguay"/></picture></a>
  <section className="valueChips" aria-label="Por qué pedir en Che Bagels"><span>Bagels hechos a mano</span><span>Delivery o Retiro</span><span>Todo en un mismo pedido</span></section>
  <section ref={catBarRef} className="quickCats" aria-label="Categorías"><a className={activeCat==="menu"?"active":""} href="#menu"><span>Más pedidos</span></a><a className={activeCat==="home-boxes"?"active":""} href="#home-boxes"><span>Para compartir</span></a><a className={activeCat==="home-bagels-calientes"?"active":""} href="#home-bagels-calientes"><span>Calientes</span></a><a className={activeCat==="home-bagels-frios"?"active":""} href="#home-bagels-frios"><span>Fríos</span></a><a className={activeCat==="home-papas-fritas"?"active":""} href="#home-papas-fritas"><span>Papas</span></a><a className={activeCat==="home-ensaladas"?"active":""} href="#home-ensaladas"><span>Ensaladas</span></a><a className={activeCat==="home-bebidas"?"active":""} href="#home-bebidas"><span>Bebidas</span></a></section>
  <section className="catalog homeCatalog" id="menu">
   {menuLoading&&<div className="menuSkeleton" aria-label="Cargando menú"><div className="skeletonTitle"/><div className="skeletonCards">{[1,2,3,4].map(x=><div className="skeletonCard" key={x}/>)}</div><div className="skeletonShare"/></div>}
   {!menuLoading&&!products.length&&<div className="emptyMenu">No pudimos cargar el menú de esta sucursal.</div>}
   {!menuLoading&&!!products.length&&<>
    <section className="homeCategory featuredSection"><div className="homeCategoryHead"><div><span>LOS FAVORITOS DE CHE</span><h2>Los más pedidos</h2><p>Si no sabés cuál elegir, empezá por acá.</p></div><a href="/menu">Ver menú completo →</a></div><div className="cards">{FEATURED_SLUGS.map(slug=>products.find(x=>x.slug===slug)).filter((x):x is Product=>Boolean(x)).map((x,i)=>{const imageSrc=x.image_url||localProductImages[x.slug]||null;return <article className="foodCard" key={x.id}><a className={"foodPic pic"+i} href={"/producto/"+x.slug}>{imageSrc?<img onError={assetFallback} loading="lazy" src={imageSrc} alt={x.name}/>:<div className="cheProductPlaceholder" role="img" aria-label={"Imagen de "+x.name+" próximamente disponible"}><span className="chePlaceholderLogo">CHE.</span><span className="chePlaceholderName">{x.name}</span><small>Favorito</small></div>}</a><div className="foodInfo"><h3><a className="productLink" href={"/producto/"+x.slug}>{x.name}</a></h3><p>{x.description||""}</p><p className="clubPointsEstimate">{pointsLabel(Number(x.price))} <small>· Demo</small></p><div className="foodAction"><strong>{money(x.price)}</strong><button onClick={()=>addToCart(x)} aria-label={"Agregar "+x.name}>Agregar</button></div></div></article>})}</div></section>
    <section className="homeCategory shareSection" id="home-boxes"><div className="homeCategoryHead"><div><span>PARA REUNIONES, OFICINA O AMIGOS</span><h2>Para compartir</h2><p>Boxes y tablas para resolver el pedido de todos.</p></div><a href="/menu#boxes">Ver Boxes y Tablas →</a></div><div className="cards">{SHARE_SLUGS.map(slug=>products.find(x=>x.slug===slug)).filter((x):x is Product=>Boolean(x)).map((x,i)=>{const imageSrc=x.image_url||localProductImages[x.slug]||null;return <article className="foodCard" key={x.id}><a className={"foodPic pic"+i} href={"/producto/"+x.slug}>{imageSrc?<img onError={assetFallback} loading="lazy" src={imageSrc} alt={x.name}/>:<><span>CHE.</span><small>Para compartir</small></>}</a><div className="foodInfo"><h3><a className="productLink" href={"/producto/"+x.slug}>{x.name}</a></h3><p>{x.description||""}</p><p className="clubPointsEstimate">{pointsLabel(Number(x.price))} <small>· Demo</small></p><div className="foodAction"><strong>{money(x.price)}</strong><button onClick={()=>addToCart(x)} aria-label={"Agregar "+x.name}>Agregar</button></div></div></article>})}</div></section>
    <div className="menuDivider"><span>SEGUÍ ELIGIENDO</span></div>
    {HOME_CATEGORIES.map(category=>{const items=products.filter(x=>x.category_slug===category.slug).slice(0,category.limit);if(!items.length)return null;return <section className="homeCategory compactCategory" id={"home-"+category.slug} key={category.slug}><div className="homeCategoryHead"><div><h2>{category.title}</h2></div><a href={"/menu#"+category.slug}>Ver todos →</a></div><div className="cards">{items.map((x,i)=>{const imageSrc=x.image_url||localProductImages[x.slug]||null;return <article className="foodCard" key={x.id}><a className={"foodPic pic"+i} href={"/producto/"+x.slug}>{imageSrc?<img onError={assetFallback} loading="lazy" src={imageSrc} alt={x.name}/>:<><span>CHE.</span><small>{category.title}</small></>}</a><div className="foodInfo"><h3><a className="productLink" href={"/producto/"+x.slug}>{x.name}</a></h3>{x.description&&<p>{x.description}</p>}<p className="clubPointsEstimate">{pointsLabel(Number(x.price))} <small>· Demo</small></p><div className="foodAction"><strong>{money(x.price)}</strong><button onClick={()=>addToCart(x)} aria-label={"Agregar "+x.name}>Agregar</button></div></div></article>})}</div></section>})}
    <a className="catalogMore" href="/menu">VER TODO EL MENÚ →</a>
   </>}
  </section>
  <section className="brandCrossSell"><div className="crossSellHead"><span>CHE BAKERY · MET CAFÉ</span><h2>Algo rico para completar.</h2><p>Muy pronto vas a poder sumar Bakery y Café al mismo pedido.</p></div><div className="brandBands"><div className="brandBanner"><picture><source media="(max-width: 760px)" srcSet="/images/banners/che-bakery-mobile.png"/><img onError={assetFallback} loading="lazy" src="/images/banners/che-bakery-desktop.png" alt="Che Bakery"/></picture></div><div className="brandBanner"><picture><source media="(max-width: 760px)" srcSet="/images/banners/met-cafe-mobile.png"/><img onError={assetFallback} loading="lazy" src="/images/banners/met-cafe-desktop.png" alt="MET Café"/></picture></div></div></section>
  <section className="cheInfoSections" aria-label="Información de CHE Bagels"><article id="nosotros" className="cheInfoIntro"><span>CONOCÉ CHE BAGELS</span><h2>Bagels artesanales, hechos para disfrutar.</h2><p>Un poco de New York en Paraguay. Elegí tus favoritos y pedí directo, con delivery o retiro según la sucursal.</p><a href="#menu">Explorar el menú →</a></article><section id="sucursales" className="cheInfoBranches"><div className="cheInfoHeading"><span>ENCONTRANOS</span><h2>Nuestras sucursales</h2><p>Elegí la ubicación que te quede mejor. La disponibilidad para pedidos se muestra en el selector.</p></div><div className="cheBranchCards"><article><h3>Recoleta</h3><p>Teniente Zotti, Asunción</p><a href="https://tr.ee/2-r-0GzYMb" target="_blank" rel="noopener noreferrer">Ver ubicación ↗</a></article><article><h3>Las Lomas</h3><p>PCGC+28M, Asunción</p><a href="https://tr.ee/_1KCHmb8ds" target="_blank" rel="noopener noreferrer">Ver ubicación ↗</a></article><article><h3>Ciudad del Este</h3><p>F9GG+CXP, Ciudad del Este</p><a href="https://tr.ee/_aIciXmanT" target="_blank" rel="noopener noreferrer">Ver ubicación ↗</a></article><article><h3>San Vicente</h3><p>Asunción</p><a href="https://maps.app.goo.gl/RAm24LD8JeLJwZBp9" target="_blank" rel="noopener noreferrer">Ver ubicación ↗</a></article></div></section><section id="contacto" className="cheInfoContact"><div><span>HABLEMOS</span><h2>¿Tenés alguna consulta?</h2><p>Escribinos por Instagram o explorá el menú para hacer tu pedido.</p></div><div className="cheContactActions"><a href="https://www.instagram.com/chebagels/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="#menu">Ver menú →</a></div></section></section>
  {cart>0&&<button className="floatingCart" onClick={openCart}><b>Ver mi pedido</b><span>{cart} {cart===1?"producto":"productos"} · {money(String(cartTotal))} →</span></button>}
  {locationOpen&&<div className="modalBack" onClick={()=>setLocationOpen(false)}><section className="locationModal" role="dialog" aria-modal="true" aria-labelledby="location-title" onClick={e=>e.stopPropagation()}><button ref={locationCloseRef} className="close" onClick={()=>setLocationOpen(false)} aria-label="Cerrar selector de sucursal">×</button><span className="modalKicker">TU PEDIDO</span><h2 id="location-title">¿Dónde estás?</h2><p>Elegí la sucursal y cómo querés recibir tu pedido.</p><div className="modalModes"><button className={mode==="DELIVERY"?"active":""} onClick={()=>setMode("DELIVERY")}>Delivery</button><button className={mode==="PICKUP"?"active":""} onClick={()=>setMode("PICKUP")}>Retiro</button></div><div className="modalBranches">{branches.map(b=><button className={b.id===branchId?"active":""} key={b.id} onClick={()=>setBranchId(b.id)}><span><b>{b.name}</b><small>{b.address}</small></span><i>{b.id===branchId?"✓":""}</i></button>)}</div>{plannedBranches.filter(planned=>!branches.some(branch=>branch.slug===planned.slug)).map(planned=><div key={planned.slug} className="modalBranchPlanned" style={{padding:"12px 16px",border:"1px solid #e5d8c9",marginTop:8,opacity:.7}}><strong>{planned.name}</strong><small style={{display:"block",marginTop:4}}>{planned.address}</small><small style={{display:"block",marginTop:4}}>Próximamente disponible para pedidos</small></div>)}<button className="modalDone" onClick={()=>setLocationOpen(false)}>LISTO, VER MENÚ</button></section></div>}
 </main>
}