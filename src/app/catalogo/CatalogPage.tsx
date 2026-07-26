"use client"

import { useEffect, useState } from "react"
import { useFavorites } from "@/hooks/useFavorites"
import GalleryCard from "@/components/GalleryCard"
import CatalogHeader from "@/components/CatalogHeader"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='710' fill='%23f3f4f6'%3E%3Crect width='400' height='710'/%3E%3C/svg%3E"

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [productTypes, setProductTypes] = useState<any[]>([])
  const [colors, setColors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toggle, isFavorite, getCount, fetchCounts, initialized } = useFavorites()

  useEffect(() => {
    async function load() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      async function api(url: string) {
        const res = await fetch(`${supabaseUrl}/rest/v1/${url}`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      }

      const [productsData, categoriesData, typesData, colorsData] = await Promise.all([
        api("products?select=*,categories(id,nombre),product_types(id,nombre)&order=destacado.desc,created_at.desc"),
        api("categories?select=*&order=nombre.asc"),
        api("product_types?select=*&order=nombre.asc"),
        api("colors?select=*&order=nombre.asc"),
      ])

      const productIds = (productsData as any[]).map((p: any) => p.id)

      const [allVariants, allSizes] = await Promise.all([
        productIds.length
          ? api(`product_variants?select=id,product_id,color_id,disponible&product_id=in.(${productIds.join(",")})`)
          : [],
        productIds.length
          ? api(`product_sizes?select=sizes(nombre),product_id&product_id=in.(${productIds.join(",")})`)
          : [],
      ])

      const variantIds = (allVariants as any[]).map((v: any) => v.id)

      const allImages = variantIds.length
        ? await api(`product_images?select=variant_id,url,sort_order&variant_id=in.(${variantIds.join(",")})`)
        : []

      const imagesByProduct: Record<number, string[]> = {}
      const imagesByColor: Record<number, Record<number, string[]>> = {}
      for (const img of (allImages as any[])) {
        const variant = (allVariants as any[]).find((v: any) => v.id === img.variant_id)
        if (!variant) continue
        if (!imagesByProduct[variant.product_id]) imagesByProduct[variant.product_id] = []
        imagesByProduct[variant.product_id].push(img.url)
        if (!imagesByColor[variant.product_id]) imagesByColor[variant.product_id] = {}
        if (!imagesByColor[variant.product_id][variant.color_id]) imagesByColor[variant.product_id][variant.color_id] = []
        imagesByColor[variant.product_id][variant.color_id].push(img.url)
      }

      const variantsByProduct: Record<number, any[]> = {}
      for (const v of (allVariants as any[])) {
        if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = []
        variantsByProduct[v.product_id].push(v)
      }

      const sizesByProduct: Record<number, string[]> = {}
      for (const ps of (allSizes as any[])) {
        const pid = ps.product_id
        if (!sizesByProduct[pid]) sizesByProduct[pid] = []
        if (ps.sizes?.nombre) sizesByProduct[pid].push(ps.sizes.nombre)
      }

      const enriched = (productsData as any[]).map((p: any) => {
        const variants = variantsByProduct[p.id] || []
        const allProductImages = imagesByProduct[p.id] || []
        const firstImage = allProductImages[0] || ""
        return {
          ...p,
          imagen_url: firstImage || PLACEHOLDER,
          images: allProductImages.length > 0 ? allProductImages : [firstImage || PLACEHOLDER],
          imagesByColor: imagesByColor[p.id] || {},
          first_variant_id: variants[0]?.id || null,
          colors: variants.map((v: any) => ({
            id: v.color_id,
            color: (colorsData as any[]).find((c: any) => c.id === v.color_id)?.nombre || "",
            hex: (colorsData as any[]).find((c: any) => c.id === v.color_id)?.codigo_hex || "#808080",
          })),
          sizes: sizesByProduct[p.id] || [],
          categories: p.categories || null,
          product_types: p.product_types || null,
        }
      })

      setProducts(enriched)
      setCategories(categoriesData)
      setProductTypes(typesData)
      setColors((colorsData as any[]).filter((c: any) => (allVariants as any[]).some((v: any) => v.color_id === c.id)))
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (initialized && products.length > 0) {
      fetchCounts(products.map((p: any) => p.id))
    }
  }, [initialized, products, fetchCounts])

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    )
  }

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
