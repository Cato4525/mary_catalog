"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import type { StoreSettings } from "@/lib/types"

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  if (pathname.startsWith("/admin")) return null

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {})
  }, [])

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
          <Link href="/" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
            Catálogo
          </Link>
        </div>
        <button
          className="sm:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
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
            <Link href="/" className="text-sm text-gray-600 hover:text-primary-600" onClick={() => setMenuOpen(false)}>
              Catálogo
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
