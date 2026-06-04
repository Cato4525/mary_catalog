"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition, useRef } from "react"

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const handleSearch = useCallback(
    (term: string) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString())
          if (term) {
            params.set("q", term)
          } else {
            params.delete("q")
          }
          params.delete("page")
          router.push(`/?${params.toString()}`)
        })
      }, 300)
    },
    [router, searchParams]
  )

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Buscar por código o nombre..."
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => handleSearch(e.target.value)}
        aria-label="Buscar productos por código o nombre"
        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
      />
    </div>
  )
}
