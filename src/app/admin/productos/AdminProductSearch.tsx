"use client"

import type { Category } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useRef } from "react"

export default function AdminProductSearch({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const handleSearch = useCallback(
    (term: string) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (term) {
          params.set("q", term)
        } else {
          params.delete("q")
        }
        router.push(`/admin/productos?${params.toString()}`)
      }, 300)
    },
    [router, searchParams]
  )

  const handleCategory = useCallback(
    (catId: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (catId) {
        params.set("categoria", catId)
      } else {
        params.delete("categoria")
      }
      router.push(`/admin/productos?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por código, nombre o color..."
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Buscar productos por código, nombre o color"
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <select
        defaultValue={searchParams.get("categoria") || ""}
        onChange={(e) => handleCategory(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
      >
        <option value="">Todas las categorías</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
        ))}
      </select>
    </div>
  )
}
