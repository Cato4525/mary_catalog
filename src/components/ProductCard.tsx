"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import ProductActions from "./ProductActions"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='710' fill='%23f3f4f6'%3E%3Crect width='400' height='710'/%3E%3C/svg%3E"

interface ProductCardProps {
  product: any
  colors?: any[]
  isFavorite?: boolean
  onToggleFavorite?: () => void
  index?: number
  total?: number
}

export default function ProductCard({
  product,
  colors = [],
  isFavorite = false,
  onToggleFavorite,
  index = 0,
  total = 0,
}: ProductCardProps) {
  const images: string[] = product.images || [product.imagen_url || PLACEHOLDER]
  const [currentImage, setCurrentImage] = useState(0)

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    const x = e.changedTouches[0].clientX - rect.left
    const width = rect.width

    if (x < width * 0.3 && currentImage > 0) {
      setCurrentImage((prev) => prev - 1)
    } else if (x > width * 0.7 && currentImage < images.length - 1) {
      setCurrentImage((prev) => prev + 1)
    }
  }

  return (
    <>
      {/* MOBILE: Full-screen TikTok style */}
      <div className="relative h-[100dvh] w-full snap-start sm:hidden">
        <div
          className="absolute inset-0"
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[currentImage] || PLACEHOLDER}
            alt={product.nombre}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
            priority
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {!product.disponible && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="rounded-full bg-red-500/90 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              Agotado
            </span>
          </div>
        )}

        {/* Counter - top left */}
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {index + 1} / {total}
          </span>
          {isFavorite && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/30 backdrop-blur-sm">
              <svg className="h-4 w-4 fill-red-500 text-red-500" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Gallery dots - top center */}
        {images.length > 1 && (
          <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
            <div className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
              {images.map((_: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentImage
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons - right side */}
        {onToggleFavorite && (
          <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
            <ProductActions
              productId={product.id}
              productName={product.nombre}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        )}

        {/* Color circles - right side below actions */}
        {colors.length > 0 && (
          <div className="absolute right-3 bottom-28 z-10 flex flex-col items-center gap-1.5">
            {colors.slice(0, 5).map((c: any, i: number) => (
              <div
                key={c.id || i}
                title={c.color || ""}
                className="h-5 w-5 rounded-full border-2 border-white/80 shadow-lg"
                style={{ backgroundColor: c.hex || "#808080" }}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-[10px] font-bold text-white/80">
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Product info - bottom */}
        <div className="absolute bottom-16 left-0 right-16 z-10 p-4">
          <Link href={`/productos/${product.id}`}>
            {product.destacado && (
              <span className="mb-1.5 inline-block rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                ★ Destacado
              </span>
            )}
            <h3 className="text-lg font-bold text-white leading-tight drop-shadow-lg">
              {product.nombre}
            </h3>
            {product.codigo && (
              <p className="mt-0.5 font-mono text-xs text-white/60">
                {product.codigo}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-2">
              {product.categories?.nombre && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  {product.categories.nombre}
                </span>
              )}
              {product.product_types?.nombre && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  {product.product_types.nombre}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* DESKTOP: Card grid style */}
      <Link
        href={`/productos/${product.id}`}
        className="group relative hidden aspect-[9/16] w-full overflow-hidden rounded-2xl bg-gray-900 sm:block"
      >
        <Image
          src={images[0] || PLACEHOLDER}
          alt={product.nombre}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {!product.disponible && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="rounded-full bg-red-500/90 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              Agotado
            </span>
          </div>
        )}

        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="absolute right-3 top-3 z-10"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                isFavorite
                  ? "bg-red-500/20 shadow-lg"
                  : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
              }`}
            >
              <svg
                className={`h-5 w-5 transition-all ${
                  isFavorite
                    ? "fill-red-500 text-red-500 scale-110"
                    : "fill-none text-white hover:scale-110"
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
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              {product.destacado && (
                <span className="mb-1.5 inline-block rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  ★ Destacado
                </span>
              )}
              <h3 className="text-lg font-bold text-white leading-tight drop-shadow-lg">
                {product.nombre}
              </h3>
              {product.codigo && (
                <p className="mt-0.5 font-mono text-xs text-white/60">
                  {product.codigo}
                </p>
              )}
              <div className="mt-1.5 flex items-center gap-2">
                {product.categories?.nombre && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                    {product.categories.nombre}
                  </span>
                )}
                {product.product_types?.nombre && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                    {product.product_types.nombre}
                  </span>
                )}
              </div>
            </div>

            {colors.length > 0 && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex flex-col gap-1.5">
                  {colors.slice(0, 5).map((c: any, i: number) => (
                    <div
                      key={c.id || i}
                      title={c.color || ""}
                      className="h-6 w-6 rounded-full border-2 border-white/80 shadow-lg transition-transform group-hover:scale-110"
                      style={{ backgroundColor: c.hex || "#808080" }}
                    />
                  ))}
                </div>
                {colors.length > 5 && (
                  <span className="text-[10px] font-bold text-white/80">
                    +{colors.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </>
  )
}
