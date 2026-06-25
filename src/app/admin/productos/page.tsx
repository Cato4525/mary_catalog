import Link from "next/link"
import Image from "next/image"
import AdminProductSearch from "./AdminProductSearch"
import DeleteProductButton from "@/components/DeleteProductButton"
import ToggleDisponibleButton from "@/components/ToggleDisponibleButton"
import { checkExpiredProducts } from "./actions"

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
  const expiredCount = await checkExpiredProducts()
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
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al Panel
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Administrar Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97]"
        >
          + Nuevo Producto
        </Link>
      </div>

      <AdminProductSearch categories={categories as any[]} />

      {expiredCount > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {expiredCount} {expiredCount === 1 ? "producto ha" : "productos han"} cumplido su ciclo de 15 días y se han desactivado automáticamente.
        </div>
      )}

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto rounded-xl border border-gray-200 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Disponible</th>
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
                  <td className="px-4 py-3">
                    <ToggleDisponibleButton
                      productId={product.id}
                      disponible={product.disponible}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/productos/${product.id}`}
            className="rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
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
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No hay productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 space-y-3 sm:hidden">
        {rows.length > 0 ? (
          rows.map((product: any) => (
            <div key={product.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src={product.images?.[0]?.url || PLACEHOLDER}
                  alt={product.nombre}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{product.nombre}</p>
                <p className="text-xs text-gray-500">{product.codigo}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {product.color && (
                    <span className="text-xs text-gray-400">{product.color}</span>
                  )}
                  {product.color && product.categories && (
                    <span className="text-gray-300">·</span>
                  )}
                  {product.categories && (
                    <span className="rounded-full bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">
                      {product.categories.nombre}
                    </span>
                  )}
                  <span className="text-xs text-gray-300">·</span>
                  <ToggleDisponibleButton
                    productId={product.id}
                    disponible={product.disponible}
                  />
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-[0.97]"
                >
                  Editar
                </Link>
                <DeleteProductButton productId={product.id} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg font-medium">No hay productos</p>
            <p className="text-sm">Crea tu primer producto para comenzar</p>
          </div>
        )}
      </div>
    </div>
  )
}
