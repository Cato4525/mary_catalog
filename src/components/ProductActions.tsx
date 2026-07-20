"use client"

import Link from "next/link"
import { useState } from "react"

interface ProductActionsProps {
  productId: number
  productName: string
  isFavorite: boolean
  onToggleFavorite: () => void
}

export default function ProductActions({
  productId,
  productName,
  isFavorite,
  onToggleFavorite,
}: ProductActionsProps) {
  const [showCopied, setShowCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/productos/${productId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          url,
        })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      } catch {}
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleFavorite}
        className="group flex flex-col items-center gap-1"
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
            isFavorite
              ? "bg-red-500/20 shadow-lg"
              : "bg-white/10 backdrop-blur-sm group-hover:bg-white/20"
          }`}
        >
          <svg
            className={`h-7 w-7 transition-all ${
              isFavorite
                ? "fill-red-500 text-red-500 scale-110"
                : "fill-none text-white group-hover:scale-110"
            }`}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <span className="text-[10px] font-medium text-white drop-shadow-md">
          Me gusta
        </span>
      </button>

      <Link
        href={`/productos/${productId}`}
        onClick={(e) => e.stopPropagation()}
        className="group flex flex-col items-center gap-1"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all group-hover:bg-white/20">
          <svg
            className="h-7 w-7 text-white transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span className="text-[10px] font-medium text-white drop-shadow-md">
          Detalles
        </span>
      </Link>

      <button
        onClick={handleShare}
        className="group flex flex-col items-center gap-1"
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all group-hover:bg-white/20">
          <svg
            className="h-7 w-7 text-white transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          {showCopied && (
            <span className="absolute -top-8 whitespace-nowrap rounded-lg bg-black/80 px-2 py-1 text-[10px] text-white">
              ¡Copiado!
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium text-white drop-shadow-md">
          Compartir
        </span>
      </button>
    </div>
  )
}
