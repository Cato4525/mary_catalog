"use client"

import { useCallback, useEffect, useState } from "react"

const VISITOR_KEY = "mary-visitor-id"
const LIKED_KEY = "mary-liked"

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return "anonymous"
  }
}

function getLikedIds(): Set<number> {
  try {
    const stored = localStorage.getItem(LIKED_KEY)
    if (stored) return new Set(JSON.parse(stored))
  } catch {}
  return new Set()
}

function saveLikedIds(ids: Set<number>) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(ids)))
  } catch {}
}

export function useFavorites() {
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({})
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    setLikedIds(getLikedIds())
    setInitialized(true)
  }, [])

  const fetchCounts = useCallback(async (productIds: number[]) => {
    if (productIds.length === 0) return
    try {
      const res = await fetch(`/api/likes?ids=${productIds.join(",")}`)
      if (res.ok) {
        const counts = await res.json()
        setLikeCounts(counts)
      }
    } catch {}
  }, [])

  const toggle = useCallback(async (productId: number) => {
    const visitorId = getVisitorId()

    setLikedIds((prev) => {
      const next = new Set(prev)
      const wasLiked = next.has(productId)
      if (wasLiked) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      saveLikedIds(next)

      setLikeCounts((prev) => ({
        ...prev,
        [productId]: Math.max(0, (prev[productId] || 0) + (wasLiked ? -1 : 1)),
      }))

      return next
    })

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, visitor_id: visitorId }),
      })
      if (res.ok) {
        const { count } = await res.json()
        setLikeCounts((prev) => ({ ...prev, [productId]: count }))
      }
    } catch {}
  }, [])

  const isFavorite = useCallback(
    (productId: number) => likedIds.has(productId),
    [likedIds]
  )

  const getCount = useCallback(
    (productId: number) => likeCounts[productId] || 0,
    [likeCounts]
  )

  return { likedIds, toggle, isFavorite, getCount, fetchCounts, initialized }
}
