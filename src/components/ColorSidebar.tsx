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

export default function ColorSidebar({ colors, horizontal = false }: { colors: Color[]; horizontal?: boolean }) {
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

  if (horizontal) {
    return (
      <div className="no-scrollbar flex items-center gap-3 overflow-x-auto py-2">
        <button
          onClick={() => handleFilter("")}
          title="Todos los colores"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
            current === ""
              ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
              : "bg-white text-gray-400 shadow-md hover:bg-gray-100 hover:text-gray-600"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {validColors.map((color) => {
          const isActive = current === String(color.id)
          return (
            <button
              key={color.id}
              onClick={() => handleFilter(String(color.id))}
              title={color.nombre}
              className={`relative h-10 w-10 shrink-0 rounded-full transition-all ${
                isActive
                  ? "scale-110 shadow-lg ring-2 ring-primary-500 ring-offset-2"
                  : "shadow-md hover:scale-105 hover:shadow-lg"
              }`}
              style={{ backgroundColor: color.codigo_hex || "#808080" }}
            >
              {isActive && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="no-scrollbar flex flex-col items-center gap-3 overflow-y-auto py-2">
      <button
        onClick={() => handleFilter("")}
        title="Todos los colores"
        className={`group flex h-11 w-11 items-center justify-center rounded-full transition-all ${
          current === ""
            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
            : "bg-white text-gray-400 shadow-md hover:bg-gray-100 hover:text-gray-600"
        }`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {validColors.map((color) => {
        const isActive = current === String(color.id)
        return (
          <button
            key={color.id}
            onClick={() => handleFilter(String(color.id))}
            title={color.nombre}
            className={`relative h-11 w-11 rounded-full transition-all ${
              isActive
                ? "scale-110 shadow-lg ring-2 ring-primary-500 ring-offset-2"
                : "hover:scale-105 shadow-md hover:shadow-lg"
            }`}
            style={{ backgroundColor: color.codigo_hex || "#808080" }}
          >
            {isActive && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white drop-shadow-md"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
