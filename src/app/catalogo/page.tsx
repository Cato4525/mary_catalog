import { Suspense } from "react"
import CatalogPage from "./CatalogPage"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='710' fill='%23f3f4f6'%3E%3Crect width='400' height='710'/%3E%3C/svg%3E"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function api(url: string) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${url}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export default async function CatalogoPage() {
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

  const products = (productsData as any[]).map((p: any) => {
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
        variant_id: v.id,
        color: (colorsData as any[]).find((c: any) => c.id === v.color_id)?.nombre || "",
        hex: (colorsData as any[]).find((c: any) => c.id === v.color_id)?.codigo_hex || "#808080",
      })),
      sizes: sizesByProduct[p.id] || [],
      categories: p.categories || null,
      product_types: p.product_types || null,
    }
  })

  const availableColors = (colorsData as any[]).filter((c: any) =>
    (allVariants as any[]).some((v: any) => v.color_id === c.id)
  )

  return (
    <Suspense fallback={null}>
      <CatalogPage
        products={products}
        categories={categoriesData as any[]}
        productTypes={typesData as any[]}
        colors={availableColors}
      />
    </Suspense>
  )
}
