import type {Metadata} from "next";
import {Inter,Montserrat} from "next/font/google";
const inter=Inter({subsets:["latin"],weight:["400","500","600","700"],display:"swap",variable:"--font-inter"});
const montserrat=Montserrat({subsets:["latin"],weight:["400","500","600","700"],display:"swap",variable:"--font-montserrat"});
import "./home.css";
import {CartProvider} from "./cart-context";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
export const metadata:Metadata={title:"CHE Bagels · Pedí online",description:"Bagels artesanales hechos a mano. Pedí Che Bagels, Che Bakery y MET Café para delivery o retiro."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body className={`${inter.variable} ${montserrat.variable}`}><CartProvider><SiteHeader/>{children}<SiteFooter/></CartProvider></body></html>}
