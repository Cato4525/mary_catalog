"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useSettings } from "@/hooks/useSettings"

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const settings = useSettings()

  if (pathname.startsWith("/admin")) return null

  const storeName = settings?.store_name || "Mary Leggings"
  const logoUrl = settings?.logo_url

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={storeName}
              width={32}
              height={32}
              className="h-8 w-auto rounded"
              unoptimized
            />
          ) : null}
          <span className="max-w-[calc(100vw-120px)] truncate text-xl font-bold tracking-tight text-primary-600">
            {storeName}
          </span>
        </Link>
        <div className="hidden items-center gap-4 sm:flex">
          <Link href="/" className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100 active:scale-[0.97]">
            Catálogo
          </Link>
          <Link href="/#contacto" className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100 active:scale-[0.97]">
            Contacto
          </Link>
        </div>
        <button
          className="sm:hidden p-3"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-gray-100 px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/" className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100" onClick={() => setMenuOpen(false)}>
              Catálogo
            </Link>
            <Link href="/#contacto" className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100" onClick={() => setMenuOpen(false)}>
              Contacto
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
