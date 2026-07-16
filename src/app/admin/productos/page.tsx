import Link from "next/link"
import Image from "next/image"
import AdminProductSearch from "./AdminProductSearch"
import DeleteProductButton from "@/components/DeleteProductButton"
import ToggleDisponibleButton from "@/components/ToggleDisponibleButton"

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

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string; tipo?: string; page?: string }
}) {
  const [products, categories, productTypes] = await Promise.all([
    api("products?select=*,categories(id,nombre),product_types(id,nombre)&order=created_at.desc"),
    api("categories?select=*&order=nombre.asc"),
    api("product_types?select=*&order=nombre.asc"),
  ])

  const productIds = (products as any[]).map((p: any) => p.id)

  const allVariants = productIds.length
    ? await api(`product_variants?select=id,product_id,color_id&product_id=in.(${productIds.join(",")})`)
    : []

  const variantIds = (allVariants as any[]).map((v: any) => v.id)

  const allImages = variantIds.length
    ? await api(`product_images?select=variant_id,url&variant_id=in.(${variantIds.join(",")})`)
    : []

  const firstImageByVariant: Record<number, string> = {}
  for (const img of (allImages as any[])) {
    if (!firstImageByVariant[img.variant_id]) {
      firstImageByVariant[img.variant_id] = img.url
    }
  }

  const colorIds = Array.from(new Set((allVariants as any[]).map((v: any) => v.color_id).filter(Boolean)))
  const colorMap: Record<number, string> = {}
  if (colorIds.length > 0) {
    const colors = await api(`colors?select=id,nombre&id=in.(${colorIds.join(",")})`)
    for (const c of (colors as any[])) {
      colorMap[c.id] = c.nombre
    }
  }

  const variantsByProduct: Record<number, any[]> = {}
  for (const v of (allVariants as any[])) {
    if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = []
    variantsByProduct[v.product_id].push(v)
  }

  let filteredProducts = (products as any[]).map((p: any) => {
    const variants = variantsByProduct[p.id] || []
    const firstVariant = variants[0]
    const firstImage = firstVariant ? firstImageByVariant[firstVariant.id] || "" : ""
    const colorNames = variants.map((v: any) => colorMap[v.color_id] || "").filter(Boolean)
    return {
      ...p,
      colorCount: variants.length,
      firstImage,
      colorNames,
      categories: p.categories || null,
      product_types: p.product_types || null,
    }
  })

  if (searchParams.q) {
    const q = searchParams.q.toLowerCase()
    filteredProducts = filteredProducts.filter(
      (p: any) =>
        p.nombre?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q) ||
        p.colorNames.some((c: string) => c.toLowerCase().includes(q))
    )
  }
  if (searchParams.categoria) {
    filteredProducts = filteredProducts.filter(
      (p: any) => String(p.categoria_id) === searchParams.categoria
    )
  }
  if (searchParams.tipo) {
    filteredProducts = filteredProducts.filter(
      (p: any) => String(p.tipo_id) === searchParams.tipo
    )
  }

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

      <AdminProductSearch
        categories={categories as any[]}
        productTypes={productTypes as any[]}
      />

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto rounded-xl border border-gray-200 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Colores</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-200">
                      <Image
                        src={product.firstImage || PLACEHOLDER}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {product.codigo || "-"}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{product.nombre}</td>
                  <td className="px-4 py-3">
                    {product.categories && (
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                        {product.categories.nombre}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {product.product_types?.nombre || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {product.colorCount}
                      {product.colorCount === 1 ? " color" : " colores"}
                    </span>
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
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No hay productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 space-y-3 sm:hidden">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => (
            <div key={product.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src={product.firstImage || PLACEHOLDER}
                  alt={product.nombre}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{product.nombre}</p>
                <p className="text-[10px] font-mono text-gray-400">{product.codigo || ""}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {product.categories && (
                    <span className="rounded-full bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">
                      {product.categories.nombre}
                    </span>
                  )}
                  {product.product_types?.nombre && (
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                      {product.product_types.nombre}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {product.colorCount} {product.colorCount === 1 ? "color" : "colores"}
                  </span>
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
