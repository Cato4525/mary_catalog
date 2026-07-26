"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useRef, useState } from "react"
import type { Category, ProductType } from "@/lib/types"

type FilterKey = "none" | "categoria" | "tipo" | "color"

export default function CatalogHeader({
  categories,
  productTypes,
  colors = [],
}: {
  categories: Category[]
  productTypes: ProductType[]
  colors?: { id: number; nombre: string; codigo_hex: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openFilter, setOpenFilter] = useState<FilterKey>("none")

  const currentCategoria = searchParams.get("categoria") || ""
  const currentTipo = searchParams.get("tipo") || ""
  const currentColor = searchParams.get("color") || ""
  const currentQ = searchParams.get("q") || ""

  const push = useCallback(
    (params: URLSearchParams) => {
      params.delete("page")
      router.push(`/?${params.toString()}`)
    },
    [router]
  )

  const handleSearch = useCallback(
    (term: string) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (term) params.set("q", term)
        else params.delete("q")
        push(params)
      }, 300)
    },
    [searchParams, push]
  )

  const handleFilter = useCallback(
    (key: string, id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) params.set(key, id)
      else params.delete(key)
      setOpenFilter("none")
      push(params)
    },
    [searchParams, push]
  )

  const toggleFilter = (f: FilterKey) => {
    setOpenFilter((prev) => (prev === f ? "none" : f))
    setSearchOpen(false)
  }

  const iconBtn =
    "shrink-0 rounded-full border bg-white p-2.5 text-gray-500 transition-all hover:text-primary-600"
  const iconBtnBase = "border-gray-200 hover:border-primary-300"
  const iconBtnActive = "!border-primary-400 !bg-primary-50 !text-primary-600"

  const activeCategoria = categories.find((c) => String(c.id) === currentCategoria)
  const activeTipo = productTypes.find((t) => String(t.id) === currentTipo)
  const activeColor = colors.find((c) => String(c.id) === currentColor)

  const dropdown =
    "absolute left-0 right-0 top-full z-50 mt-2 max-h-[50vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg"

  const itemBase = "w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors"
  const itemActive = "bg-primary-50 text-primary-700"
  const itemInactive = "text-gray-600 hover:bg-gray-50"

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {searchOpen && (
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar..."
                defaultValue={currentQ}
                onChange={(e) => handleSearch(e.target.value)}
                onBlur={() => { if (!inputRef.current?.value) setSearchOpen(false) }}
                autoFocus
                aria-label="Buscar productos"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          )}
        </div>

        <button
          onClick={() => { setSearchOpen((p) => !p); setOpenFilter("none"); if (searchOpen) handleSearch("") }}
          className={`${iconBtn} ${iconBtnBase} ${searchOpen ? iconBtnActive : ""}`}
          aria-label="Buscar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {categories.length > 0 && (
          <button
            onClick={() => toggleFilter("categoria")}
            className={`${iconBtn} ${iconBtnBase} ${openFilter === "categoria" || currentCategoria ? iconBtnActive : ""}`}
            aria-label="Categorías"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>
        )}

        {productTypes.length > 0 && (
          <button
            onClick={() => toggleFilter("tipo")}
            className={`${iconBtn} ${iconBtnBase} ${openFilter === "tipo" || currentTipo ? iconBtnActive : ""}`}
            aria-label="Tipos"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        )}

        {colors.length > 0 && (
          <button
            onClick={() => toggleFilter("color")}
            className={`${iconBtn} ${iconBtnBase} ${openFilter === "color" || currentColor ? iconBtnActive : ""}`}
            aria-label="Colores"
          >
            {activeColor ? (
              <span className="block h-5 w-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: activeColor.codigo_hex }} />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            )}
          </button>
        )}
      </div>

      {openFilter === "categoria" && (
        <div className={dropdown}>
          <button onClick={() => handleFilter("categoria", "")} className={`${itemBase} ${!currentCategoria ? itemActive : itemInactive}`}>
            Todas las categorías
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => handleFilter("categoria", String(cat.id))} className={`${itemBase} ${currentCategoria === String(cat.id) ? itemActive : itemInactive}`}>
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {openFilter === "tipo" && (
        <div className={dropdown}>
          <button onClick={() => handleFilter("tipo", "")} className={`${itemBase} ${!currentTipo ? itemActive : itemInactive}`}>
            Todos los tipos
          </button>
          {productTypes.map((t) => (
            <button key={t.id} onClick={() => handleFilter("tipo", String(t.id))} className={`${itemBase} ${currentTipo === String(t.id) ? itemActive : itemInactive}`}>
              {t.nombre}
            </button>
          ))}
        </div>
      )}

      {openFilter === "color" && (
        <div className={dropdown}>
          <button onClick={() => handleFilter("color", "")} className={`${itemBase} ${!currentColor ? itemActive : itemInactive}`}>
            Todos los colores
          </button>
          {colors.map((c) => (
            <button key={c.id} onClick={() => handleFilter("color", String(c.id))} className={`${itemBase} flex items-center gap-2 ${currentColor === String(c.id) ? itemActive : itemInactive}`}>
              <span className="h-4 w-4 shrink-0 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: c.codigo_hex }} />
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      {openFilter !== "none" && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenFilter("none")} />
      )}
    </div>
  )
}
