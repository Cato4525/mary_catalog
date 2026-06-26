"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { useState } from "react"
import CartDrawer from "./CartDrawer"

const TABS = [
  {
    href: "/",
    label: "Inicio",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/?search=1",
    label: "Buscar",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: "#cart",
    label: "Carrito",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
  },
  {
    href: "#contacto",
    label: "Contacto",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { totalItems } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  if (pathname.startsWith("/admin")) return null

  const handleTabClick = (e: React.MouseEvent, href: string) => {
    if (href === "#cart") {
      e.preventDefault()
      setCartOpen(true)
      return
    }
    if (href === "#contacto") {
      e.preventDefault()
      if (pathname === "/") {
        document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
      } else {
        window.location.href = "/#contacto"
      }
      return
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && !searchParams?.has("search")
    if (href.includes("search")) return pathname === "/" && searchParams?.has("search")
    return false
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom,0px)] sm:hidden">
        <div className="flex items-center justify-around">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              onClick={(e) => handleTabClick(e, tab.href)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] transition-colors ${
                isActive(tab.href)
                  ? "text-primary-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.label === "Carrito" && totalItems > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white leading-none shadow-sm">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
