import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import WhatsAppButton from "@/components/WhatsAppButton"

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
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <WhatsAppButton />
        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Mary Leggings. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  )
}
