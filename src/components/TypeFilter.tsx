"use client"

import type { ProductType } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export default function TypeFilter({ types }: { types: ProductType[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("tipo") || ""

  const handleFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("tipo", value)
      } else {
        params.delete("tipo")
      }
      params.delete("page")
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  if (types.length === 0) return null

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
        Todos los tipos
      </button>
      {types.map((type) => (
        <button
          key={type.id}
          onClick={() => handleFilter(String(type.id))}
          aria-pressed={current === String(type.id)}
          className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
            current === String(type.id)
              ? "border-primary-600 bg-primary-600 text-white shadow-sm"
              : "border-gray-300 bg-white text-gray-600 hover:border-primary-400 hover:bg-primary-50 active:scale-[0.97]"
          }`}
        >
          {type.nombre}
        </button>
      ))}
    </div>
  )
}
