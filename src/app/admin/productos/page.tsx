import Link from "next/link"
import Image from "next/image"
import AdminProductSearch from "./AdminProductSearch"
import DeleteProductButton from "@/components/DeleteProductButton"

export const dynamic = "force-dynamic"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23f3f4f6'%3E%3Crect width='80' height='80'/%3E%3C/svg%3E"

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

export default async function AdminProductosPage() {
  const products = await api("products?select=*&order=created_at.desc")

  const productIds = (products as any[]).map((p) => p.id)
  const catIds = Array.from(
    new Set(
      (products as any[])
        .map((p) => p.categoria_id)
        .filter(Boolean)
    )
  ) as number[]

  const [allImages, catMap] = await Promise.all([
    productIds.length
      ? api(`product_images?select=*&product_id=in.(${productIds.join(",")})&order=sort_order.asc`)
      : Promise.resolve([]),
    catIds.length
      ? api(`categories?select=*&id=in.(${catIds.join(",")})`)
      : Promise.resolve([]),
  ])

  const imagesByProduct: Record<number, any[]> = {}
  for (const img of allImages as any[]) {
    if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = []
    imagesByProduct[img.product_id].push(img)
  }

  const catById: Record<number, any> = {}
  for (const c of catMap as any[]) catById[c.id] = c

  const rows = (products as any[]).map((p: any) => ({
    ...p,
    images: imagesByProduct[p.id] || [],
    categories: catById[p.categoria_id] || null,
  }))

  const categories = await api("categories?select=*&order=nombre.asc")

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Administrar Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          + Nuevo Producto
        </Link>
      </div>

      <AdminProductSearch categories={categories as any[]} />

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length > 0 ? (
              rows.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-200">
                      <Image
                        src={product.images?.[0]?.url || PLACEHOLDER}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{product.codigo}</td>
                  <td className="px-4 py-3 text-gray-700">{product.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{product.color}</td>
                  <td className="px-4 py-3">
                    {product.categories && (
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                        {product.categories.nombre}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
                      >
                        Editar
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No hay productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
