import Image from "next/image"
import Link from "next/link"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='710' fill='%23f3f4f6'%3E%3Crect width='400' height='710'/%3E%3C/svg%3E"

interface ProductCardProps {
  product: any
  colors?: any[]
}

export default function ProductCard({ product, colors = [] }: ProductCardProps) {
  const imageUrl = product.imagen_url || PLACEHOLDER

  return (
    <Link href={`/productos/${product.id}`} className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-gray-900">
      <Image
        src={imageUrl}
        alt={product.nombre}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, 50vw"
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
  )
}
