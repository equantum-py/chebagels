"use client";

import { useEffect, useMemo, useState } from "react";
import "./home.css";

type Branch={id:string;name:string;slug:string;address:string};
type Mode="DELIVERY"|"PICKUP";

export default function Home(){
  const [branches,setBranches]=useState<Branch[]>([]);
  const [branchId,setBranchId]=useState("");
  const [mode,setMode]=useState<Mode>("DELIVERY");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const selected=useMemo(()=>branches.find(b=>b.id===branchId),[branches,branchId]);

  useEffect(()=>{
    fetch("/api/branches").then(r=>{if(!r.ok)throw new Error();return r.json()})
      .then((data:Branch[])=>{setBranches(data);setBranchId(data[0]?.id??"")})
      .catch(()=>setError("No pudimos cargar las sucursales."))
      .finally(()=>setLoading(false));
  },[]);

  function continueOrder(){
    if(!branchId)return;
    localStorage.setItem("che_branch_id",branchId);
    localStorage.setItem("che_order_type",mode);
    window.location.href="/menu";
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brandmark">CHE<span>.</span></div>
      <div className="brandline">BAGELS <i>·</i> BAKERY <i>·</i> MET CAFÉ</div>
    </header>

    <section className="hero">
      <div className="eyebrow">PEDÍ DIRECTO · FÁCIL · RÁPIDO</div>
      <h1>¿Qué se te antoja<br/>hoy?</h1>
      <p>Elegí tu sucursal y cómo querés recibir tu pedido. Nosotros nos encargamos del resto.</p>
    </section>

    <section className="orderCard">
      <div className="step"><b>1</b><span>Elegí cómo querés tu pedido</span></div>
      <div className="modes">
        <button className={mode==="DELIVERY"?"mode active":"mode"} onClick={()=>setMode("DELIVERY")}>
          <span className="modeIcon">⌂</span><strong>Delivery</strong><small>Te lo llevamos</small>
        </button>
        <button className={mode==="PICKUP"?"mode active":"mode"} onClick={()=>setMode("PICKUP")}>
          <span className="modeIcon">▣</span><strong>Retiro</strong><small>Pasá a buscarlo</small>
        </button>
      </div>

      <div className="step second"><b>2</b><span>Seleccioná tu sucursal</span></div>
      {loading&&<div className="notice">Cargando sucursales…</div>}
      {error&&<div className="notice error">{error}</div>}
      {!loading&&!error&&<div className="branches">
        {branches.map(branch=><button key={branch.id} className={branchId===branch.id?"branch selected":"branch"} onClick={()=>setBranchId(branch.id)}>
          <span><strong>{branch.name}</strong><small>{branch.address}</small></span>
          <span className="radio">{branchId===branch.id?"✓":""}</span>
        </button>)}
      </div>}

      <button className="continue" disabled={!branchId||loading} onClick={continueOrder}>VER MENÚ <span>→</span></button>
      {selected&&<p className="selection">Pedido para <b>{selected.name}</b> · {mode==="DELIVERY"?"Delivery":"Retiro"}</p>}
    </section>

    <section className="brands">
      <div><strong>CHE BAGELS</strong><span>Bagels artesanales estilo New York</span></div>
      <div><strong>CHE BAKERY</strong><span>Panadería & cosas ricas</span></div>
      <div><strong>MET CAFÉ</strong><span>Café para acompañar</span></div>
    </section>
    <footer>Hecho para disfrutar. <b>CHE.</b></footer>
  </main>
}