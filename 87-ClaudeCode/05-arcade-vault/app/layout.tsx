import type { Metadata } from "next";
import { Courier_Prime, JetBrains_Mono, Press_Start_2P } from "next/font/google";
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

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arcade Vault",
  description: "Insert a coin to play: arcade classics in your browser, plus a hall of fame.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="arcade" className={`${pressStart.variable} ${courierPrime.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ArcadeBackdrop className="av-app">
          <Suspense fallback={<NavbarFallback />}>
            <Navbar />
          </Suspense>
          <main className="av-main">{children}</main>
          <footer className="av-footer">© 2026 ARCADE VAULT · MADE WITH PIXELS AND NEON · v2.6.0</footer>
        </ArcadeBackdrop>
      </body>
    </html>
  );
}
