"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useSettings } from "@/hooks/useSettings"

export default function Navbar() {
  const pathname = usePathname()
  const settings = useSettings()

  if (pathname.startsWith("/admin")) return null

  const storeName = settings?.store_name || "Mary Leggings"
  const logoUrl = settings?.logo_url

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={storeName}
              width={32}
              height={32}
              className="h-8 w-auto rounded shrink-0"
              unoptimized
            />
          ) : null}
          <span className="truncate text-xl font-bold tracking-tight text-primary-600">
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
      </div>
    </nav>
  )
}
