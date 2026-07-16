import type { Product, ProductVariant, ProductImage } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' fill='%23f3f4f6'%3E%3Crect width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dy='.3em'%3ESin imagen%3C/text%3E%3C/svg%3E"

interface Props {
  product: Product & {
    codigo?: string
    variants?: (ProductVariant & { color?: string; images?: ProductImage[] })[]
  }
  priority?: boolean
}

export default function ProductCard({ product, priority }: Props) {
  const variants = product.variants || []
  const firstVariant = variants[0]
  const firstImage = firstVariant?.images?.[0]?.url || ""
  const totalImages = variants.reduce(
    (sum, v) => sum + (v.images?.length || 0),
    0
  )

  return (
    <div className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-lg">
      <Link
        href={`/productos/${product.id}`}
        className="block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
          <Image
            src={firstImage || PLACEHOLDER}
            alt={product.nombre}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={!!firstImage}
          />
          {variants.length > 1 && (
            <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              +{variants.length - 1} colores
            </span>
          )}
        </div>
        <div className="space-y-1 p-4">
          {product.codigo && (
            <p className="font-mono text-[10px] text-gray-400">{product.codigo}</p>
          )}
          <h3 className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary-700">
            {product.nombre}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            {product.categories && (
              <span className="truncate rounded-full bg-primary-50 px-2 py-0.5 text-primary-700">
                {product.categories.nombre}
              </span>
            )}
            {variants.length > 0 && (
              <>
                <span className="shrink-0">·</span>
                <span className="truncate">
                  {variants.length === 1
                    ? variants[0].color || "Color"
                    : `${variants.length} colores`}
                </span>
              </>
            )}
          </div>
          {totalImages > 1 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{totalImages} imágenes</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
