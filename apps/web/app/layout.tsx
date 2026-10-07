import type {Metadata} from "next";
import "./home.css";
import {CartProvider} from "./cart-context";
export const metadata:Metadata={title:"CHE Bagels · Pedí online",description:"Bagels artesanales hechos a mano. Pedí Che Bagels, Che Bakery y MET Café para delivery o retiro."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body><CartProvider>{children}</CartProvider></body></html>}
