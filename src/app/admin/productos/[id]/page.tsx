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
      <ProductForm product={productWithImages} categories={categories as any[]} />
    </div>
  )
}
