"use client"

import { useFavorites } from "@/hooks/useFavorites"
import ProductCard from "./ProductCard"

interface ProductGridProps {
  products: any[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { toggle, isFavorite } = useFavorites()

  return (
    <>
      {/* MOBILE: TikTok full-screen scroll */}
      <div className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory sm:hidden">
        {products.map((product: any, index: number) => (
          <ProductCard
            key={product.id}
            product={product}
            colors={product.colors}
            isFavorite={isFavorite(product.id)}
            onToggleFavorite={() => toggle(product.id)}
            index={index}
            total={products.length}
          />
        ))}
      </div>

      {/* DESKTOP: Grid */}
      <div className="hidden grid-cols-2 gap-2 sm:grid sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
            colors={product.colors}
            isFavorite={isFavorite(product.id)}
            onToggleFavorite={() => toggle(product.id)}
          />
        ))}
      </div>
    </>
  )
}
