"use client"

import Image from "next/image"
import Link from "next/link"
import { useFavorites } from "@/hooks/useFavorites"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='710' fill='%23f3f4f6'%3E%3Crect width='400' height='710'/%3E%3C/svg%3E"

interface Props {
  product: any
  colors?: any[]
  isFavorite?: boolean
  likeCount?: number
  onToggleFavorite?: () => void
}

export default function GalleryCard({ product, colors = [], isFavorite = false, likeCount = 0, onToggleFavorite }: Props) {
  const images: string[] = product.images || [product.imagen_url || PLACEHOLDER]

  return (
    <Link
      href={`/productos/${product.id}`}
      className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100"
    >
      <Image
        src={images[0] || PLACEHOLDER}
        alt={product.nombre}
        fill
        className="object-cover"
        sizes="33vw"
        unoptimized
      />

      {!product.disponible && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-semibold text-white">
            Agotado
          </span>
        </div>
      )}

      {onToggleFavorite && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite() }}
          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
        >
          <svg
            className={`h-3 w-3 ${isFavorite ? "fill-red-500 text-red-500" : "fill-none text-white"}`}
            stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-6">
        <h3 className="truncate text-[11px] font-bold text-white leading-tight">
          {product.nombre}
        </h3>
        {product.codigo && (
          <p className="font-mono text-[9px] text-white/50">{product.codigo}</p>
        )}
        {colors.length > 0 && (
          <div className="mt-0.5 flex gap-0.5">
            {colors.slice(0, 4).map((c: any, i: number) => (
              <div
                key={c.id || i}
                className="h-2.5 w-2.5 rounded-full border border-white/50"
                style={{ backgroundColor: c.hex || "#808080" }}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[8px] text-white/60">+{colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
