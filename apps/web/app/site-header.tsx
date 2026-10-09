"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
import {useCart} from "./cart-context";
import {SITE_NAV,BRANCH_INFO} from "./site-nav";
type Branch={id:string;name:string;slug:string;address:string};
export default function SiteHeader(){
 const path=usePathname(),{count,openCart}=useCart();
 const [branches,setBranches]=useState<Branch[]>([]),[branchId,setBranchId]=useState(""),[mode,setMode]=useState<"DELIVERY"|"PICKUP">("DELIVERY"),[chooser,setChooser]=useState(false),[mobile,setMobile]=useState(false);
 const closeRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{setMode(localStorage.getItem("che_order_type")==="PICKUP"?"PICKUP":"DELIVERY");fetch("/api/branches").then(r=>r.ok?r.json():[]).then((data:Branch[])=>{if(!Array.isArray(data))return;setBranches(data);setBranchId(localStorage.getItem("che_branch_id")||data[0]?.id||"")}).catch(()=>{});},[]);
 useEffect(()=>{setMobile(false)},[path]);
 useEffect(()=>{if(!chooser&&!mobile)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setChooser(false);setMobile(false)}};document.addEventListener("keydown",onKey);return()=>document.removeEventListener("keydown",onKey)},[chooser,mobile]);
 useEffect(()=>{if(chooser)closeRef.current?.focus()},[chooser]);
 const setBranch=(id:string)=>{setBranchId(id);localStorage.setItem("che_branch_id",id);window.dispatchEvent(new Event("che:location-change"))};
 const setOrderMode=(next:"DELIVERY"|"PICKUP")=>{setMode(next);localStorage.setItem("che_order_type",next);window.dispatchEvent(new Event("che:location-change"))};
 const selected=branches.find(x=>x.id===branchId),display=BRANCH_INFO.find(x=>x.slug===selected?.slug);
 return <header className="siteHeader">
 <div className="siteHeaderTop"><Link href="/" className="siteBrand" aria-label="CHE Bagels, inicio"><img src="/images/che-bagels-logo.png" alt="CHE Bagels"/></Link><nav className="siteLinks" aria-label="Navegación principal">{SITE_NAV.map(item=><Link key={item.href} href={item.href} aria-current={path===item.href||(item.href==="/club"&&path.startsWith("/club/"))?"page":undefined}>{item.label}</Link>)}</nav><div className="siteHeaderActions"><button className="siteCart" onClick={openCart} aria-label={`Abrir mi pedido, ${count} productos`}>Mi pedido <b>{count}</b></button><button className="siteMobileToggle" onClick={()=>setMobile(v=>!v)} aria-expanded={mobile} aria-controls="site-mobile-menu" aria-label={mobile?"Cerrar menú":"Abrir menú"}>{mobile?"×":"☰"}</button></div></div>
 <div className="siteHeaderOrder"><button onClick={()=>setChooser(true)} className="siteBranchButton">⌖ {display?.name||selected?.name||"Elegí sucursal"} <span>⌄</span></button><div className="siteOrderModes"><button className={mode==="DELIVERY"?"active":""} onClick={()=>setOrderMode("DELIVERY")}>Delivery</button><button className={mode==="PICKUP"?"active":""} onClick={()=>setOrderMode("PICKUP")}>Retiro</button></div></div>
 {mobile&&<nav id="site-mobile-menu" className="siteMobileMenu" aria-label="Navegación móvil">{SITE_NAV.map(item=><Link key={item.href} href={item.href} onClick={()=>setMobile(false)}>{item.label}</Link>)}<button onClick={()=>{setChooser(true);setMobile(false)}}>Cambiar sucursal · {display?.name||selected?.name||"Elegir"}</button><div className="siteMobileModes"><button onClick={()=>setOrderMode("DELIVERY")}>Delivery {mode==="DELIVERY"?"✓":""}</button><button onClick={()=>setOrderMode("PICKUP")}>Retiro {mode==="PICKUP"?"✓":""}</button></div></nav>}
 {chooser&&<div className="siteModalBackdrop" onClick={()=>setChooser(false)}><section className="siteModal" role="dialog" aria-modal="true" aria-labelledby="site-branch-title" onClick={e=>e.stopPropagation()}><button ref={closeRef} className="siteModalClose" aria-label="Cerrar" onClick={()=>setChooser(false)}>×</button><h2 id="site-branch-title">Elegí tu sucursal</h2><p>Seleccioná dónde querés hacer tu pedido.</p>{branches.map(item=>{const info=BRANCH_INFO.find(x=>x.slug===item.slug);return <button className={item.id===branchId?"selected":""} key={item.id} onClick={()=>setBranch(item.id)}><strong>{info?.name||item.name}</strong><small>{info?.address||item.address}</small></button>})}<button className="siteModalDone" onClick={()=>setChooser(false)}>Listo, continuar</button></section></div>}
 </header>;
}
