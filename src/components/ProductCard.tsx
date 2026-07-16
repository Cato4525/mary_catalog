import Image from "next/image"
import Link from "next/link"
import AddToCartButton from "./AddToCartButton"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='560' fill='%23f3f4f6'%3E%3Crect width='400' height='560'/%3E%3C/svg%3E"

interface ProductCardProps {
  product: any
  colors?: any[]
}

export default function ProductCard({ product, colors = [] }: ProductCardProps) {
  const imageUrl = product.imagen_url || PLACEHOLDER

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <Link href={`/productos/${product.id}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50">
          <Image
            src={imageUrl}
            alt={product.nombre}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
          {!product.disponible && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                Agotado
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono text-gray-400 mb-1">
                {product.codigo || ""}
              </p>
              <h3 className="font-semibold text-gray-900 truncate">{product.nombre}</h3>
            </div>
            {product.destacado && (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                ★
              </span>
            )}
          </div>
          {product.categories && (
            <p className="mt-1 text-sm text-primary-600">{product.categories.nombre}</p>
          )}
          {product.product_types?.nombre && (
            <p className="mt-0.5 text-xs text-gray-500">{product.product_types.nombre}</p>
          )}
        </div>
      </Link>
      {colors.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {colors.slice(0, 6).map((c: any, i: number) => (
                <div
                  key={c.id || i}
                  title={c.color || ""}
                  className="h-4 w-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: c.hex || "#e5e7eb" }}
                />
              ))}
            </div>
            {colors.length > 6 && (
              <span className="text-[10px] text-gray-500">+{colors.length - 6}</span>
            )}
          </div>
        </div>
      )}
      <div className="px-4 pb-4">
        <AddToCartButton product={product} />
      </div>
    </div>
  )
}
