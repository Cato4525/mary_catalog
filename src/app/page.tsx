import CatalogHeader from "@/components/CatalogHeader"
import ColorSidebar from "@/components/ColorSidebar"
import ContactSection from "@/components/ContactSection"
import ProductGrid from "@/components/ProductGrid"

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='710' fill='%23f3f4f6'%3E%3Crect width='400' height='710'/%3E%3C/svg%3E"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function api(url: string) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${url}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    next: { revalidate: 60 },
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

  const [allVariants, allSizes] = await Promise.all([
    productIds.length
      ? api(`product_variants?select=id,product_id,color_id,disponible&product_id=in.(${productIds.join(",")})`)
      : [],
    productIds.length
      ? api(`product_sizes?select=sizes(nombre),product_id&product_id=in.(${productIds.join(",")})`)
      : [],
  ])

  const variantIds = (allVariants as any[]).map((v: any) => v.id)

  const allImages = variantIds.length
    ? await api(`product_images?select=variant_id,url,sort_order&variant_id=in.(${variantIds.join(",")})`)
    : []

  const imagesByProduct: Record<number, string[]> = {}
  for (const img of (allImages as any[])) {
    const variant = (allVariants as any[]).find((v: any) => v.id === img.variant_id)
    if (!variant) continue
    if (!imagesByProduct[variant.product_id]) imagesByProduct[variant.product_id] = []
    imagesByProduct[variant.product_id].push(img.url)
  }

  const sizesByProduct: Record<number, string[]> = {}
  for (const ps of (allSizes as any[])) {
    const pid = ps.product_id
    if (!sizesByProduct[pid]) sizesByProduct[pid] = []
    if (ps.sizes?.nombre) sizesByProduct[pid].push(ps.sizes.nombre)
  }

  const variantsByProduct: Record<number, any[]> = {}
  for (const v of (allVariants as any[])) {
    if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = []
    variantsByProduct[v.product_id].push(v)
  }

  const availableColorIds = new Set((allVariants as any[]).map((v: any) => v.color_id))
  const availableColors = (colors as any[]).filter((c: any) => availableColorIds.has(c.id))

  let filteredProducts = (products as any[])
    .map((p: any) => {
      const variants = variantsByProduct[p.id] || []
      const allProductImages = imagesByProduct[p.id] || []
      const firstImage = allProductImages[0] || ""
      const colorNames = variants
        .map((v: any) => {
          const color = (colors as any[]).find((c: any) => c.id === v.color_id)
          return color ? color.nombre : ""
        })
        .filter(Boolean)
      return {
        ...p,
        imagen_url: firstImage || PLACEHOLDER,
        images: allProductImages.length > 0 ? allProductImages : [firstImage || PLACEHOLDER],
        first_variant_id: variants[0]?.id || null,
        colors: variants.map((v: any) => ({
          id: v.color_id,
          variant_id: v.id,
          color: (colors as any[]).find((c: any) => c.id === v.color_id)?.nombre || "",
          hex: (colors as any[]).find((c: any) => c.id === v.color_id)?.codigo_hex || "#808080",
        })),
        colorNames,
        sizes: sizesByProduct[p.id] || [],
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
    <>
      {/* MOBILE: Full-screen TikTok scroll */}
      <div className="relative sm:hidden">
        {/* Top: store name + search + filters */}
        <div className="absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black/70 via-black/40 to-transparent pt-3 pb-6">
          <div className="px-4">
            <h1 className="text-lg font-bold text-white drop-shadow-lg">Mary</h1>
          </div>
          <div className="px-3 pt-2">
            <CatalogHeader
              categories={categories as any[]}
              productTypes={productTypes as any[]}
              colors={availableColors as any[]}
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="flex h-[100dvh] flex-col items-center justify-center text-gray-400">
            <svg className="mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-medium">No se encontraron productos</p>
            <p className="text-sm">Intenta con otros filtros</p>
          </div>
        )}
      </div>

      {/* DESKTOP: Grid with sidebar */}
      <div className="hidden sm:block">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Mary</h1>
          </div>
        </div>

        <div className="sticky top-14 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <CatalogHeader
              categories={categories as any[]}
              productTypes={productTypes as any[]}
              colors={availableColors as any[]}
            />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex gap-4">
            <div className="sticky top-[8.5rem] h-[calc(100vh-10rem)]">
              <ColorSidebar colors={availableColors} />
            </div>

            <div className="min-w-0 flex-1">
              <ProductGrid products={filteredProducts} />
            </div>
          </div>
        </div>
      </div>

      <ContactSection />
    </>
  )
}
