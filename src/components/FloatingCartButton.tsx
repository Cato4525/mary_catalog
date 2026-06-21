"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useCart } from "@/context/CartContext"
import CartDrawer from "./CartDrawer"

export default function FloatingCartButton() {
  const pathname = usePathname()
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCart()

  if (pathname.startsWith("/admin")) return null
  if (totalItems === 0) return null

  return (
    <>
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-20 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl active:scale-90"
        aria-label="Abrir carrito"
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-sm">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
