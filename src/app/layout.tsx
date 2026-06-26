import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import WhatsAppButton from "@/components/WhatsAppButton"
import FloatingCartButton from "@/components/FloatingCartButton"
import { CartProvider } from "@/context/CartContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mary Leggings - Catálogo",
  description: "Catálogo online de leggings",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} pb-16 sm:pb-0`}>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <WhatsAppButton />
          <FloatingCartButton />
          <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Mary Leggings. Todos los derechos reservados.</p>
          </footer>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </CartProvider>
      </body>
    </html>
  )
}
