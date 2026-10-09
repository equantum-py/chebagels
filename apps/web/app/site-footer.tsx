import Link from "next/link";import {SITE_NAV} from "./site-nav";
export default function SiteFooter(){return <footer className="siteFooter"><div><strong>CHE Bagels</strong><p>Bagels artesanales · CHE Bakery · MET Café</p></div><nav aria-label="Navegación de pie de página">{SITE_NAV.map(x=><Link key={x.href} href={x.href}>{x.label}</Link>)}</nav></footer>}
