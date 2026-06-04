"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    setHasSession(document.cookie.includes("admin_session="))
  }, [])

  if (pathname === "/admin/login") return null
  if (!hasSession) return null

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setHasSession(false)
    router.replace("/admin/login")
  }

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Panel
        </Link>
        <Link
          href="/admin/productos"
          className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
        >
          Productos
        </Link>
        <Link
          href="/admin/categorias"
          className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
        >
          Categorías
        </Link>
        <Link
          href="/admin/ajustes"
          className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
        >
          Ajustes
        </Link>
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Ver tienda →
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
