"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
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
  const [selectedColor, setSelectedColor] = useState<number | null>(null)

  const allImages: string[] = product.images || [product.imagen_url || PLACEHOLDER]
  const colorImages: Record<number, string[]> = product.imagesByColor || {}

  const currentImages = selectedColor && colorImages[selectedColor]
    ? colorImages[selectedColor]
    : allImages

  return (
    <Link
      href={`/productos/${product.id}`}
      className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100"
    >
      <Image
        src={currentImages[0] || PLACEHOLDER}
        alt={product.nombre}
        fill
        className="object-cover transition-opacity duration-200"
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

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2 pt-8">
        {product.codigo && (
          <p className="font-mono text-lg font-black text-white leading-none tracking-wide">
            {product.codigo}
          </p>
        )}
        <h3 className="mt-0.5 truncate text-[11px] font-semibold text-white leading-tight">
          {product.nombre}
        </h3>
        {colors.length > 0 && (
          <div className="mt-1.5 flex gap-1">
            {colors.slice(0, 5).map((c: any, i: number) => (
              <button
                key={c.id || i}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedColor((prev) => prev === c.id ? null : c.id)
                }}
                className={`h-4 w-4 rounded-full border-2 transition-all ${
                  selectedColor === c.id
                    ? "scale-125 border-white shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    : "border-white/60 hover:scale-110"
                }`}
                style={{ backgroundColor: c.hex || "#808080" }}
                title={c.color}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-[8px] text-white/60 leading-none self-center">+{colors.length - 5}</span>
            )}
          </div>
        )}
        {product.sizes?.length > 0 && (
          <p className="mt-1 text-[10px] font-medium text-white/60 leading-none">
            {product.sizes.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  )
}
