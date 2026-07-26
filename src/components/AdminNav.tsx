"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const ALL_LINKS = [
  { href: "/admin", label: "Panel", icon: "home" as const },
  { href: "/admin/productos", label: "Productos", icon: "box" as const },
  { href: "/admin/categorias", label: "Categorías", icon: "tag" as const },
  { href: "/admin/tipos", label: "Tipos", icon: "layers" as const },
  { href: "/admin/colores", label: "Colores", icon: "palette" as const },
  { href: "/admin/tallas", label: "Tallas", icon: "ruler" as const },
  { href: "/admin/ajustes", label: "Ajustes", icon: "settings" as const },
]

const BOTTOM_LINKS = [
  { href: "/admin", label: "Panel", icon: "home" as const },
  { href: "/admin/productos", label: "Productos", icon: "box" as const },
  { href: "/admin/categorias", label: "Categorías", icon: "tag" as const },
  { href: "/admin/colores", label: "Colores", icon: "palette" as const },
]

export default function AdminNav({ hasSession }: { hasSession: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [drawerOpen])

  if (pathname === "/admin/login") return null
  if (!hasSession) return null

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/admin/login")
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const icon = (name: string, className = "h-5 w-5") => {
    const s = className
    switch (name) {
      case "home":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      case "box":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      case "tag":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
      case "layers":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
      case "palette":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
      case "ruler":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
      case "settings":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      case "menu":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      case "more":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
      case "store":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      case "logout":
        return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      default:
        return null
    }
  }

  const extraLinks = ALL_LINKS.filter(
    (l) => !BOTTOM_LINKS.some((b) => b.href === l.href)
  )

  return (
    <>
      {/* ── Mobile header ── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-xl md:hidden">
        <div className="flex h-12 items-center justify-between px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors active:bg-gray-100"
            aria-label="Abrir menú"
          >
            {icon("menu")}
          </button>
          <span className="text-sm font-bold tracking-tight text-gray-900">Admin</span>
          <Link
            href="/"
            className="-mr-1 flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors active:bg-gray-100"
            aria-label="Ver tienda"
          >
            {icon("store", "h-5 w-5")}
          </Link>
        </div>
      </header>

      {/* ── Drawer backdrop ── */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity md:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Drawer ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-3 border-b border-gray-100 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white">
            M
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Mary Leggings</p>
            <p className="text-[10px] text-gray-400">Panel de administración</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Menú</p>
          <div className="space-y-0.5">
            {ALL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${
                  isActive(link.href)
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-gray-600 active:bg-gray-100"
                }`}
              >
                {icon(link.icon)}
                {link.label}
                {isActive(link.href) && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-gray-100 px-3 py-3 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all active:bg-gray-100 active:scale-[0.97]"
          >
            {icon("store")}
            Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition-all active:bg-red-50 active:scale-[0.97]"
          >
            {icon("logout")}
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] md:hidden">
        <div className="flex items-center justify-around px-1 pt-1 pb-1">
          {BOTTOM_LINKS.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5"
              >
                <div className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${
                  active ? "bg-primary-50" : ""
                }`}>
                  {icon(link.icon, `h-5 w-5 transition-colors ${active ? "text-primary-600" : "text-gray-400"}`)}
                </div>
                <span className={`text-[10px] font-semibold transition-colors ${
                  active ? "text-primary-600" : "text-gray-400"
                }`}>
                  {link.label}
                </span>
                {active && (
                  <span className="absolute -top-0.5 h-0.5 w-4 rounded-full bg-primary-500" />
                )}
              </Link>
            )
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5"
          >
            <div className="flex h-8 w-12 items-center justify-center rounded-full">
              {icon("more", "h-5 w-5 text-gray-400")}
            </div>
            <span className="text-[10px] font-semibold text-gray-400">Más</span>
          </button>
        </div>
      </nav>

      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-gray-200 bg-white shadow-sm lg:flex">
        <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            M
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Mary Leggings</p>
            <p className="text-[10px] text-gray-400">Panel de administración</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {ALL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive(link.href)
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-[0.97]"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 px-3 py-4 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition-all hover:bg-gray-100 active:scale-[0.97]"
          >
            Ver tienda →
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-500 transition-all hover:bg-red-50 active:scale-[0.97]"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
