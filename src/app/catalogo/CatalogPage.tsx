"use client"

import { useEffect } from "react"
import { useFavorites } from "@/hooks/useFavorites"
import GalleryCard from "@/components/GalleryCard"
import CatalogHeader from "@/components/CatalogHeader"

interface CatalogPageProps {
  products: any[]
  categories: any[]
  productTypes: any[]
  colors: any[]
}

export default function CatalogPage({
  products,
  categories,
  productTypes,
  colors,
}: CatalogPageProps) {
  const { toggle, isFavorite, getCount, fetchCounts, initialized } = useFavorites()

  useEffect(() => {
    if (initialized && products.length > 0) {
      fetchCounts(products.map((p: any) => p.id))
    }
  }, [initialized, products, fetchCounts])

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-3 py-3">
          <CatalogHeader categories={categories} productTypes={productTypes} colors={colors} />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-2 py-3">
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product: any) => (
            <GalleryCard
              key={product.id}
              product={product}
              colors={product.colors}
              isFavorite={isFavorite(product.id)}
              likeCount={getCount(product.id)}
              onToggleFavorite={() => toggle(product.id)}
            />
          ))}
        </div>
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-lg font-medium">No hay productos</p>
          </div>
        )}
      </div>
    </div>
  )
}
