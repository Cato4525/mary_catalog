import Link from "next/link"
import { notFound } from "next/navigation"
import ProductForm from "../ProductForm"

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

export default async function EditarProductoPage({
  params,
}: {
  params: { id: string }
}) {
  const productId = Number(params.id)

  const [products, variants, categories, productTypes, colors] = await Promise.all([
    api(`products?select=*&id=eq.${productId}`),
    api(`product_variants?select=*&product_id=eq.${productId}&order=created_at.asc`),
    api("categories?select=*&order=nombre.asc"),
    api("product_types?select=*&order=nombre.asc"),
    api("colors?select=*&order=nombre.asc"),
  ])

  const product = (products as any[])?.[0]
  if (!product) notFound()

  const variantIds = (variants as any[]).map((v: any) => v.id)

  const allImages = variantIds.length
    ? await api(`product_images?select=*&variant_id=in.(${variantIds.join(",")})&order=sort_order.asc`)
    : []

  const imagesByVariant: Record<number, any[]> = {}
  for (const img of (allImages as any[])) {
    if (!imagesByVariant[img.variant_id]) imagesByVariant[img.variant_id] = []
    imagesByVariant[img.variant_id].push(img)
  }

  const variantsWithImages = (variants as any[]).map((v: any) => ({
    ...v,
    images: imagesByVariant[v.id] || [],
  }))

  const productWithVariants = {
    ...product,
    variants: variantsWithImages,
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/admin/productos"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Productos
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar Producto</h1>
      <ProductForm
        product={productWithVariants as any}
        categories={(categories as any[]) || []}
        productTypes={(productTypes as any[]) || []}
        colors={(colors as any[]) || []}
      />
    </div>
  )
}
