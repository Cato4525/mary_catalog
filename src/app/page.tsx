import type { Product, StoreSettings } from "@/lib/types"
import ProductCard from "@/components/ProductCard"
import SearchBar from "@/components/SearchBar"
import CategoryFilter from "@/components/CategoryFilter"
import ColorFilter from "@/components/ColorFilter"
import TypeFilter from "@/components/TypeFilter"
import Image from "next/image"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: { q?: string; categoria?: string; tipo?: string; color?: string; page?: string }
}

const PAGE_SIZE = 12

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

export default async function HomePage({ searchParams }: Props) {
  const { q, categoria, tipo, color, page } = searchParams
  const currentPage = Number(page) || 1

  const settingsArr = await api("store_settings?id=eq.1&select=*")
  const settings = (settingsArr as any[])?.[0] || null

  let matchingProductIds: number[] | null = null
  if (color) {
    const colorRecord = await api(`colors?select=id&nombre=eq.${encodeURIComponent(color)}`)
    if ((colorRecord as any[]).length > 0) {
      const colorId = (colorRecord as any[])[0].id
      const colorVariants = await api(
        `product_variants?select=product_id&color_id=eq.${colorId}&activo=eq.true`
      )
      matchingProductIds = (colorVariants as any[]).map((v: any) => v.product_id)
    }
    if (!matchingProductIds || matchingProductIds.length === 0) {
      matchingProductIds = [-1]
    }
  }

  let searchProductIds: number[] | null = null
  if (q) {
    const nameResults = await api(
      `products?select=id&nombre=ilike.*${q}*`
    )
    const nameIds = (nameResults as any[]).map((p: any) => p.id)

    const codeResults = await api(
      `products?select=id&codigo=ilike.*${q}*`
    )
    const codeIds = (codeResults as any[]).map((p: any) => p.id)

    const colorRecords = await api(
      `colors?select=id&nombre=ilike.*${q}*`
    )
    const colorIds = (colorRecords as any[]).map((c: any) => c.id)
    let colorSearchIds: number[] = []
    if (colorIds.length > 0) {
      const colorSearchVariants = await api(
        `product_variants?select=product_id&color_id=in.(${colorIds.join(",")})`
      )
      colorSearchIds = (colorSearchVariants as any[]).map((v: any) => v.product_id)
    }

    searchProductIds = Array.from(new Set([...nameIds, ...codeIds, ...colorSearchIds]))
    if (searchProductIds.length === 0) {
      searchProductIds = [-1]
    }
  }

  let url = "products?select=*,categories(id,nombre),product_types(id,nombre)&order=created_at.desc"
  const filters: string[] = []
  filters.push("disponible=eq.true")

  if (matchingProductIds) {
    filters.push(`id=in.(${matchingProductIds.join(",")})`)
  }
  if (searchProductIds) {
    filters.push(`id=in.(${searchProductIds.join(",")})`)
  }
  if (categoria) {
    filters.push(`categoria_id=eq.${categoria}`)
  }
  if (tipo) {
    filters.push(`tipo_id=eq.${tipo}`)
  }

  if (filters.length) url += "&" + filters.join("&")

  const countUrl = `${supabaseUrl}/rest/v1/products?select=count&${filters.join("&")}`
  const [data, countRes] = await Promise.all([
    api(url + `&offset=${(currentPage - 1) * PAGE_SIZE}&limit=${PAGE_SIZE}`),
    fetch(countUrl, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Prefer: "count=exact" },
      cache: "no-store",
    }),
  ])

  const products = data as any[]
  const countText = countRes.headers.get("content-range") || "0-0/0"
  const count = parseInt(countText.split("/")[1] || "0", 10)

  const productIds = products.map((p: any) => p.id)

  const [allVariants, categories, productTypes] = await Promise.all([
    productIds.length
      ? api(`product_variants?select=*&product_id=in.(${productIds.join(",")})&activo=eq.true&order=created_at.asc`)
      : Promise.resolve([]),
    api("categories?select=*&order=nombre.asc"),
    api("product_types?select=*&order=nombre.asc"),
  ])

  const variantIds = (allVariants as any[]).map((v: any) => v.id)

  const allImages = variantIds.length
    ? await api(`product_images?select=*&variant_id=in.(${variantIds.join(",")})&order=sort_order.asc`)
    : []

  const imagesByVariant: Record<number, any[]> = {}
  for (const img of (allImages as any[]) || []) {
    if (!imagesByVariant[img.variant_id]) imagesByVariant[img.variant_id] = []
    imagesByVariant[img.variant_id].push(img)
  }

  const variantsByProduct: Record<number, any[]> = {}
  for (const v of (allVariants as any[]) || []) {
    if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = []
    variantsByProduct[v.product_id].push(v)
  }

  const allColorIds = Array.from(new Set((allVariants as any[]).map((v: any) => v.color_id).filter(Boolean)))
  const colorMap: Record<number, { nombre: string; codigo_hex: string }> = {}
  if (allColorIds.length > 0) {
    const colors = await api(`colors?select=id,nombre,codigo_hex&id=in.(${allColorIds.join(",")})`)
    for (const c of (colors as any[])) {
      colorMap[c.id] = { nombre: c.nombre, codigo_hex: c.codigo_hex }
    }
  }

  const uniqueColors = Object.values(colorMap).map((c) => c.nombre).filter(Boolean)
  const uniqueTypes = (productTypes as any[]).map((t: any) => t.nombre).filter(Boolean)

  const productsWithVariants = products.map((p: any) => {
    const variants = (variantsByProduct[p.id] || []).map((v: any) => ({
      ...v,
      color: colorMap[v.color_id]?.nombre || "",
      color_hex: colorMap[v.color_id]?.codigo_hex || null,
      images: imagesByVariant[v.id] || [],
    }))
    return {
      ...p,
      variants,
      categories: p.categories || null,
    }
  })

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1
  const store = settings as StoreSettings | null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        {store?.logo_url && (
          <Image
            src={store.logo_url}
            alt={store.store_name || "Logo"}
            width={80}
            height={80}
            className="mb-4 h-16 w-auto rounded"
            unoptimized
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">
            {store?.store_name || "Catálogo"}
          </h1>
          <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
            {count} {count === 1 ? "producto" : "productos"}
          </span>
        </div>
        {store?.store_description && (
          <p className="mt-1 text-gray-500">{store.store_description}</p>
        )}
      </div>

      <div className="mb-6 space-y-4">
        <SearchBar />
        <CategoryFilter categories={(categories as any[]) || []} />
        <TypeFilter types={(productTypes as any[]) || []} />
        <ColorFilter colors={uniqueColors} />
      </div>

      {productsWithVariants.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productsWithVariants.map((product: any, i: number) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/?${new URLSearchParams({
                    ...(q && { q }),
                    ...(categoria && { categoria }),
                    ...(tipo && { tipo }),
                    ...(color && { color }),
                    page: String(p),
                  }).toString()}`}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    p === currentPage
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-[0.97]"
                  }`}
                >
                  {p}
                </a>
              ))}
            </nav>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-medium">No se encontraron productos</p>
          <p className="text-sm">Intenta con otros términos de búsqueda</p>
        </div>
      )}

      <div id="contacto" className="mt-16 border-t border-gray-200 pt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Contacto</h2>
        {store && (store.contact_email || store.contact_phone || store.address) ? (
          <div className="space-y-2 text-sm text-gray-500">
            {store.contact_email && (
              <p className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${store.contact_email}`} className="break-all hover:text-primary-600 transition-colors">{store.contact_email}</a>
              </p>
            )}
            {store.contact_phone && (
              <p className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${store.contact_phone}`} className="break-all hover:text-primary-600 transition-colors">{store.contact_phone}</a>
              </p>
            )}
            {store.address && (
              <p className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="break-all">{store.address}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Próximamente</p>
        )}
      </div>
    </div>
  )
}
