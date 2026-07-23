import { notFound } from "next/navigation"
import ProductDetail from "./ProductDetail"

export const dynamic = "force-dynamic"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function api(url: string) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${url}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const products = await api(`products?select=*,categories(nombre)&id=eq.${params.id}`)
    const product = products[0]
    if (!product) notFound()

    const variants = await api(`product_variants?select=*&product_id=eq.${params.id}&order=orden.asc`)

    const colorIds = Array.from(new Set(variants.map((v: any) => v.color_id).filter(Boolean)))
    const colors = colorIds.length
      ? await api(`colors?select=*&id=in.(${colorIds.join(",")})`)
      : []
    const colorMap: Record<number, any> = {}
    for (const c of colors) colorMap[c.id] = c

    const variantIds = variants.map((v: any) => v.id)
    const images = variantIds.length
      ? await api(`product_images?select=*&variant_id=in.(${variantIds.join(",")})`)
      : []

    const variantImages: Record<number, any[]> = {}
    for (const img of images) {
      if (!variantImages[img.variant_id]) variantImages[img.variant_id] = []
      variantImages[img.variant_id].push(img)
    }

    const enrichedVariants = variants.map((v: any) => ({
      ...v,
      colors: colorMap[v.color_id] || null,
      images: (variantImages[v.id] || []).sort((a: any, b: any) => a.orden - b.orden),
    }))

    const productSizesData = await api(`product_sizes?select=sizes(nombre)&product_id=eq.${params.id}`)
    const sizeNames = productSizesData
      .map((ps: any) => ps.sizes?.nombre)
      .filter(Boolean)

    return (
      <ProductDetail
        product={{
          ...product,
          categories: product.categories || null,
        }}
        variants={enrichedVariants}
        sizes={sizeNames}
      />
    )
  } catch {
    notFound()
  }
}
