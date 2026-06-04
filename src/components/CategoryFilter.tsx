"use client"

import type { Category } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

export default function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("categoria") || ""
  const [, startTransition] = useTransition()

  const handleFilter = useCallback(
    (value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
          params.set("categoria", value)
        } else {
          params.delete("categoria")
        }
        params.delete("page")
        router.push(`/?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => handleFilter("")}
        aria-pressed={current === ""}
        className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
          current === ""
            ? "bg-primary-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Todas
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleFilter(String(cat.id))}
          aria-pressed={current === String(cat.id)}
          className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
            current === String(cat.id)
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  )
}
