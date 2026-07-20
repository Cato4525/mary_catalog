"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useRef, useState } from "react"

interface Category {
  id: number
  nombre: string
}

interface ProductType {
  id: number
  nombre: string
}

export default function CatalogHeader({
  categories,
  productTypes,
}: {
  categories: Category[]
  productTypes: ProductType[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const [openFilter, setOpenFilter] = useState<"none" | "categoria" | "tipo">("none")

  const currentCategoria = searchParams.get("categoria") || ""
  const currentTipo = searchParams.get("tipo") || ""
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

  const handleCategoria = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) params.set("categoria", id)
      else params.delete("categoria")
      setOpenFilter("none")
      push(params)
    },
    [searchParams, push]
  )

  const handleTipo = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) params.set("tipo", id)
      else params.delete("tipo")
      setOpenFilter("none")
      push(params)
    },
    [searchParams, push]
  )

  const toggleFilter = (f: "categoria" | "tipo") => {
    setOpenFilter((prev) => (prev === f ? "none" : f))
  }

  const activeCategoria = categories.find((c) => String(c.id) === currentCategoria)
  const activeTipo = productTypes.find((t) => String(t.id) === currentTipo)

  return (
    <div className="relative">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            defaultValue={currentQ}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Buscar productos"
            className="w-full rounded-xl border border-white/20 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-sm transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 sm:border-gray-200 sm:bg-gray-50 sm:py-3"
          />
        </div>

        <button
          onClick={() => toggleFilter("categoria")}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium backdrop-blur-sm transition-all sm:px-4 sm:py-3 ${
            currentCategoria
              ? "border-primary-300 bg-primary-50/90 text-primary-700"
              : "border-white/20 bg-white/90 text-gray-600 hover:border-gray-300 hover:bg-white sm:border-gray-200 sm:bg-gray-50"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="hidden sm:inline">{activeCategoria?.nombre || "Categoría"}</span>
        </button>

        <button
          onClick={() => toggleFilter("tipo")}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium backdrop-blur-sm transition-all sm:px-4 sm:py-3 ${
            currentTipo
              ? "border-primary-300 bg-primary-50/90 text-primary-700"
              : "border-white/20 bg-white/90 text-gray-600 hover:border-gray-300 hover:bg-white sm:border-gray-200 sm:bg-gray-50"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="hidden sm:inline">{activeTipo?.nombre || "Tipo"}</span>
        </button>
      </div>

      {openFilter === "categoria" && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[50vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <button
            onClick={() => handleCategoria("")}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              !currentCategoria ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Todas las categorías
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoria(String(cat.id))}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                currentCategoria === String(cat.id)
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {openFilter === "tipo" && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[50vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <button
            onClick={() => handleTipo("")}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              !currentTipo ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Todos los tipos
          </button>
          {productTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTipo(String(t.id))}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                currentTipo === String(t.id)
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.nombre}
            </button>
          ))}
        </div>
      )}

      {(openFilter === "categoria" || openFilter === "tipo") && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenFilter("none")}
        />
      )}
    </div>
  )
}
