
"use client"
import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import Navbar from "@/components/navbar"
import { useEffect, useState } from "react"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}> 
      <body className="bg-background text-foreground font-sans"> 
        {mounted ? (
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        ) : null}
      </body>
    </html>
  );
}
