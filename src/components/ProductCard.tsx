import type { Product } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import AddToCartButton from "./AddToCartButton"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' fill='%23f3f4f6'%3E%3Crect width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dy='.3em'%3ESin imagen%3C/text%3E%3C/svg%3E"

export default function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const images = product.images || []
  const firstImage = images[0]?.url || ""

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
          {images.length > 1 && (
            <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              +{images.length - 1}
            </span>
          )}
        </div>
        <div className="space-y-1 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-primary-500">
            {product.codigo}
          </p>
          <h3 className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary-700">{product.nombre}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            {product.categories && (
              <span className="truncate rounded-full bg-primary-50 px-2 py-0.5 text-primary-700">
                {product.categories.nombre}
              </span>
            )}
            <span className="shrink-0">•</span>
            <span className="truncate">{product.color}</span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <AddToCartButton
          product={{
            id: product.id,
            codigo: product.codigo,
            nombre: product.nombre,
            color: product.color,
            categoria: product.categories?.nombre || "",
            imagen_url: firstImage,
          }}
        />
      </div>
    </div>
  )
}
