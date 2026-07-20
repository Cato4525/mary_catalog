"use client"

import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "mary-favorites"

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)))
      }
    } catch {}
  }, [])

  const toggle = useCallback((productId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (productId: number) => favorites.has(productId),
    [favorites]
  )

  return { favorites, toggle, isFavorite }
}
