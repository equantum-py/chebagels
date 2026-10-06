import type { Metadata } from "next";
import "./home.css";
export const metadata: Metadata={title:"CHE · Pedí online",description:"Che Bagels · Che Bakery · MET Café — pedí delivery o retiro."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>;}
