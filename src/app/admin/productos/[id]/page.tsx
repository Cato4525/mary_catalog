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

  const [products, productImages, categories] = await Promise.all([
    api(`products?select=*&id=eq.${productId}`),
    api(`product_images?select=*&product_id=eq.${productId}&order=sort_order.asc`),
    api("categories?select=*&order=nombre.asc"),
  ])

  const product = (products as any[])?.[0]
  if (!product) notFound()

  const productWithImages = { ...product, images: productImages }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar Producto</h1>
      <ProductForm product={productWithImages} categories={categories as any[]} />
    </div>
  )
}
