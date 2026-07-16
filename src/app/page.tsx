import Image from "next/image"
import Link from "next/link"
import SearchBar from "@/components/SearchBar"
import ColorFilter from "@/components/ColorFilter"
import TypeFilter from "@/components/TypeFilter"
import ProductCard from "@/components/ProductCard"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='560' fill='%23f3f4f6'%3E%3Crect width='400' height='560'/%3E%3C/svg%3E"

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

export default async function Home({
  searchParams,
}: {
  searchParams: {
    q?: string
    categoria?: string
    tipo?: string
    color?: string
  }
}) {
  const [products, categories, productTypes, colors] = await Promise.all([
    api("products?select=*,categories(id,nombre),product_types(id,nombre)&order=destacado.desc,created_at.desc"),
    api("categories?select=*&order=nombre.asc"),
    api("product_types?select=*&order=nombre.asc"),
    api("colors?select=*&order=nombre.asc"),
  ])

  const productIds = (products as any[]).map((p: any) => p.id)

  const allVariants = productIds.length
    ? await api(`product_variants?select=id,product_id,color_id,disponible&disponible=eq.true&product_id=in.(${productIds.join(",")})`)
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

  const variantsByProduct: Record<number, any[]> = {}
  for (const v of (allVariants as any[])) {
    if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = []
    variantsByProduct[v.product_id].push(v)
  }

  let filteredProducts = (products as any[])
    .map((p: any) => {
      const variants = variantsByProduct[p.id] || []
      const firstVariant = variants[0]
      const firstImage = firstVariant ? firstImageByVariant[firstVariant.id] || "" : ""
      const colorNames = variants
        .map((v: any) => {
          const color = (colors as any[]).find((c: any) => c.id === v.color_id)
          return color ? color.nombre : ""
        })
        .filter(Boolean)
      return {
        ...p,
        imagen_url: firstImage || PLACEHOLDER,
        colors: variants.map((v: any) => ({
          id: v.color_id,
          color: (colors as any[]).find((c: any) => c.id === v.color_id)?.nombre || "",
          hex: (colors as any[]).find((c: any) => c.id === v.color_id)?.hex || "#e5e7eb",
        })),
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
  if (searchParams.color) {
    filteredProducts = filteredProducts.filter((p: any) =>
      p.colors.some(
        (c: any) => String(c.id) === searchParams.color
      )
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Mary Catálogo</h1>
        <p className="mt-2 text-gray-500">Leggings de moda</p>
      </div>

      <SearchBar />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <TypeFilter types={productTypes as any[]} />
        <ColorFilter colors={colors as any[]} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} colors={product.colors} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-medium">No se encontraron productos</p>
            <p className="text-sm">Intenta con otros filtros</p>
          </div>
        )}
      </div>
    </div>
  )
}
