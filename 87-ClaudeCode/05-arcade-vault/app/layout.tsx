import type { Metadata } from "next";
import { Courier_Prime, Press_Start_2P } from "next/font/google";
import { Suspense } from "react";
import { ArcadeBackdrop } from "@/components/ui/basics";
import { Navbar, NavbarFallback } from "@/components/ui/navbar";
import "./globals.css";

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arcade Vault",
  description: "Inserta una moneda para jugar: clásicos arcade en tu navegador y el salón de la fama.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="arcade" className={`${pressStart.variable} ${courierPrime.variable}`}>
      <body>
        <ArcadeBackdrop className="av-app">
          <Suspense fallback={<NavbarFallback />}>
            <Navbar />
          </Suspense>
          <main className="av-main">{children}</main>
        </ArcadeBackdrop>
      </body>
    </html>
  );
}
