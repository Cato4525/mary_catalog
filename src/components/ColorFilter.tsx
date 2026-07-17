"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface Color {
  id: number
  nombre: string
  codigo_hex: string
  activo: boolean
  created_at: string
}

export default function ColorFilter({ colors }: { colors: Color[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("color") || ""

  const handleFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("color", value)
      } else {
        params.delete("color")
      }
      params.delete("page")
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  if (!Array.isArray(colors) || colors.length === 0) return null

  const validColors = colors.filter(
    (c) => c && typeof c.id === "number" && typeof c.nombre === "string"
  )

  if (validColors.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => handleFilter("")}
        aria-pressed={current === ""}
        className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
          current === ""
              ? "border-primary-600 bg-primary-600 text-white shadow-sm"
            : "border-gray-300 bg-white text-gray-600 hover:border-primary-400 hover:bg-primary-50 active:scale-[0.97]"
        }`}
      >
        Todos los colores
      </button>
      {validColors.map((color) => (
        <button
          key={color.id}
          onClick={() => handleFilter(String(color.id))}
          aria-pressed={current === String(color.id)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
            current === String(color.id)
              ? "border-primary-600 bg-primary-600 text-white shadow-sm"
              : "border-gray-300 bg-white text-gray-600 hover:border-primary-400 hover:bg-primary-50 active:scale-[0.97]"
          }`}
        >
          <span
            className="h-3 w-3 rounded-full border border-gray-300"
            style={{ backgroundColor: color.codigo_hex || "#808080" }}
          />
          {color.nombre}
        </button>
      ))}
    </div>
  )
}
