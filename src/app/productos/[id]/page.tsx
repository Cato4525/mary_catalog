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
  const products = await api(`products?select=*,categories(nombre)&id=eq.${params.id}`)
  const product = products[0]
  if (!product) notFound()

  const variants = await api(`product_variants?select=*,colors(nombre,hex)&product_id=eq.${params.id}&order=orden.asc`)

  const variantIds = variants.map((v: any) => v.id)
  const images = variantIds.length
    ? await api(`product_images?select=*&variant_id=in.(${variantIds.join(",")})&orden.asc`)
    : []

  const variantImages: Record<number, any[]> = {}
  for (const img of images) {
    if (!variantImages[img.variant_id]) variantImages[img.variant_id] = []
    variantImages[img.variant_id].push(img)
  }

  const enrichedVariants = variants.map((v: any) => ({
    ...v,
    images: variantImages[v.id] || [],
  }))

  return (
    <ProductDetail
      product={{
        ...product,
        categories: product.categories || null,
      }}
      variants={enrichedVariants}
    />
  )
}
