import type { Product, StoreSettings } from "@/lib/types"
import ProductCard from "@/components/ProductCard"
import SearchBar from "@/components/SearchBar"
import CategoryFilter from "@/components/CategoryFilter"
import Image from "next/image"

interface Props {
  searchParams: { q?: string; categoria?: string; page?: string }
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
  const { q, categoria, page } = searchParams
  const currentPage = Number(page) || 1

  const [settingsArr] = await Promise.all([api("store_settings?id=eq.1&select=*")])
  const settings = (settingsArr as any[])?.[0] || null

  let url = "products?select=*&order=created_at.desc"
  const filters: string[] = []
  if (q) {
    filters.push(`or=(codigo.ilike.*${q}*,nombre.ilike.*${q}*)`)
  }
  if (categoria) {
    filters.push(`categoria_id=eq.${categoria}`)
  }
  if (filters.length) url += "&" + filters.join("&")

  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  url += `&offset=${from}&limit=${PAGE_SIZE}`

  const [{ products, count }, categories] = await Promise.all([
    (async () => {
      const countUrl = `${supabaseUrl}/rest/v1/products?select=count&${filters.join("&")}`.replace(/&offset=.*$/, "").replace(/&limit=.*$/, "")
      const [data, countRes] = await Promise.all([
        api(url),
        fetch(countUrl, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Prefer: "count=exact" },
          cache: "no-store",
        }),
      ])
      const countText = countRes.headers.get("content-range") || "0-0/0"
      const total = parseInt(countText.split("/")[1] || "0", 10)
      return { products: data, count: total }
    })(),
    api("categories?select=*&order=nombre.asc"),
  ]) as any

  const productIds = (products as any[])?.map((p: any) => p.id) || []
  const catIds = Array.from(
    new Set(
      (products as any[])
        .map((p: any) => p.categoria_id)
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
  for (const img of (allImages as any[]) || []) {
    if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = []
    imagesByProduct[img.product_id].push(img)
  }

  const catById: Record<number, any> = {}
  for (const c of (catMap as any[]) || []) catById[c.id] = c

  const productsWithImages = ((products as any[]) || []).map((p: any) => ({
    ...p,
    images: imagesByProduct[p.id] || [],
    categories: catById[p.categoria_id] || null,
  }))

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
        <h1 className="text-3xl font-bold text-gray-900">
          {store?.store_name || "Catálogo"}
        </h1>
        {store?.store_description && (
          <p className="mt-1 text-gray-500">{store.store_description}</p>
        )}
      </div>

      <div className="mb-6 space-y-4">
        <SearchBar />
        <CategoryFilter categories={categories as any[]} />
      </div>

      {productsWithImages.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(productsWithImages as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/?${new URLSearchParams({
                    ...(q && { q }),
                    ...(categoria && { categoria }),
                    page: String(p),
                  }).toString()}`}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
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

      {store && (store.contact_email || store.contact_phone || store.address) && (
        <div className="mt-16 border-t border-gray-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Contacto</h2>
          <div className="space-y-2 text-sm text-gray-500">
            {store.contact_email && (
              <p className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="break-all">{store.contact_email}</span>
              </p>
            )}
            {store.contact_phone && (
              <p className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="break-all">{store.contact_phone}</span>
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
        </div>
      )}
    </div>
  )
}
