"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export default function ColorFilter({ colors }: { colors: string[] }) {
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

  if (colors.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => handleFilter("")}
        aria-pressed={current === ""}
        className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
          current === ""
            ? "border-primary-600 bg-primary-600 text-white shadow-sm"
            : "border-transparent bg-gray-100 text-gray-600 hover:border-primary-400 hover:bg-gray-200 active:scale-[0.97]"
        }`}
      >
        Todos los colores
      </button>
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => handleFilter(color)}
          aria-pressed={current === color}
          className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
            current === color
              ? "border-primary-600 bg-primary-600 text-white shadow-sm"
              : "border-transparent bg-gray-100 text-gray-600 hover:border-primary-400 hover:bg-gray-200 active:scale-[0.97]"
          }`}
        >
          {color}
        </button>
      ))}
    </div>
  )
}
