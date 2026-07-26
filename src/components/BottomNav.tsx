"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { useState } from "react"
import CartDrawer from "./CartDrawer"

export default function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { totalItems } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  if (pathname.startsWith("/admin")) return null

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setCartOpen(true)
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent("bottomnav:addToCart"))
  }

  const handleContactoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === "/") {
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
    } else {
      window.location.href = "/#contacto"
    }
  }

  const isHome = pathname === "/"
  const isContacto = false

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden pb-[env(safe-area-inset-bottom,0px)]">
        <div className="relative flex items-end justify-around bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 pt-1.5 pb-2">
          {/* Inicio */}
          <Link
            href="/"
            className={`flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors ${
              isHome && !searchParams?.has("favorites") ? "text-primary-600" : "text-gray-400"
            }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Inicio</span>
          </Link>

          {/* Catálogo */}
          <Link
            href="/"
            className={`flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors ${
              isHome && !searchParams?.has("favorites") ? "text-primary-600" : "text-gray-400"
            }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Catálogo</span>
          </Link>

          {/* Agregar al carrito */}
          <button
            onClick={handleAddToCartClick}
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-gray-400 transition-colors active:text-primary-600"
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <svg className="absolute -bottom-0.5 -right-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium leading-none">Agregar</span>
          </button>

          {/* Carrito - Botón central elevado */}
          <div className="flex flex-1 justify-center -mt-5">
            <button
              onClick={handleCartClick}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-xl active:scale-95"
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Contacto */}
          <Link
            href="#contacto"
            onClick={handleContactoClick}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors ${
              isContacto ? "text-primary-600" : "text-gray-400"
            }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Contacto</span>
          </Link>
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
