"use client"

import type { Category } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export default function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("categoria") || ""

  const handleFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("categoria", value)
      } else {
        params.delete("categoria")
      }
      params.delete("page")
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

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
        Todas
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleFilter(String(cat.id))}
          aria-pressed={current === String(cat.id)}
          className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
            current === String(cat.id)
              ? "border-primary-600 bg-primary-600 text-white shadow-sm"
              : "border-transparent bg-gray-100 text-gray-600 hover:border-primary-400 hover:bg-gray-200 active:scale-[0.97]"
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  )
}
