import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import ProductDetail from "./ProductDetail"

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

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const productId = Number(params.id)

  const [products, variants, settingsArr] = await Promise.all([
    api(`products?select=*,categories(id,nombre),product_types(id,nombre)&id=eq.${productId}`),
    api(`product_variants?select=*&product_id=eq.${productId}&activo=eq.true&order=created_at.asc`),
    api("store_settings?id=eq.1&select=*"),
  ])

  const product = (products as any[])?.[0]
  if (!product || product.disponible === false) notFound()

  const settings = (settingsArr as any[])?.[0] || null

  const variantIds = (variants as any[]).map((v: any) => v.id)

  const allImages = variantIds.length
    ? await api(`product_images?select=*&variant_id=in.(${variantIds.join(",")})&order=sort_order.asc`)
    : []

  const imagesByVariant: Record<number, any[]> = {}
  for (const img of (allImages as any[])) {
    if (!imagesByVariant[img.variant_id]) imagesByVariant[img.variant_id] = []
    imagesByVariant[img.variant_id].push(img)
  }

  const colorIds = Array.from(new Set((variants as any[]).map((v: any) => v.color_id).filter(Boolean)))
  const colorMap: Record<number, { nombre: string; codigo_hex: string }> = {}
  if (colorIds.length > 0) {
    const colors = await api(`colors?select=id,nombre,codigo_hex&id=in.(${colorIds.join(",")})`)
    for (const c of (colors as any[])) {
      colorMap[c.id] = { nombre: c.nombre, codigo_hex: c.codigo_hex }
    }
  }

  const variantsWithImages = (variants as any[]).map((v: any) => ({
    ...v,
    color: colorMap[v.color_id]?.nombre || "",
    color_hex: colorMap[v.color_id]?.codigo_hex || null,
    images: imagesByVariant[v.id] || [],
  }))

  const related = product.categoria_id
    ? await (async () => {
        const r = await api(
          `products?select=*,categories(id,nombre)&categoria_id=eq.${product.categoria_id}&id=neq.${product.id}&disponible=eq.true&limit=4&order=created_at.desc`
        )
        const rids = (r as any[]).map((x: any) => x.id)
        if (rids.length === 0) return []

        const rVariants = await api(
          `product_variants?select=*&product_id=in.(${rids.join(",")})&activo=eq.true`
        )
        const rvIds = (rVariants as any[]).map((v: any) => v.id)
        const rImages = rvIds.length
          ? await api(`product_images?select=*&variant_id=in.(${rvIds.join(",")})&order=sort_order.asc`)
          : []

        const rColorIds = Array.from(new Set((rVariants as any[]).map((v: any) => v.color_id).filter(Boolean)))
        const rColorMap: Record<number, string> = {}
        if (rColorIds.length > 0) {
          const rColors = await api(`colors?select=id,nombre&id=in.(${rColorIds.join(",")})`)
          for (const c of (rColors as any[])) rColorMap[c.id] = c.nombre
        }

        const imgsByVar: Record<number, any[]> = {}
        for (const img of (rImages as any[])) {
          if (!imgsByVar[img.variant_id]) imgsByVar[img.variant_id] = []
          imgsByVar[img.variant_id].push(img)
        }
        const varsByProd: Record<number, any[]> = {}
        for (const v of (rVariants as any[])) {
          if (!varsByProd[v.product_id]) varsByProd[v.product_id] = []
          varsByProd[v.product_id].push(v)
        }

        return (r as any[]).map((x: any) => {
          const variants = (varsByProd[x.id] || []).map((v: any) => ({
            ...v,
            color: rColorMap[v.color_id] || "",
            images: imgsByVar[v.id] || [],
          }))
          return { ...x, variants, categories: x.categories || null }
        })
      })()
    : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al catálogo
      </Link>

      <ProductDetail
        product={product}
        variants={variantsWithImages}
        whatsapp={settings?.whatsapp || ""}
        category={product.categories || null}
        productType={product.product_types || null}
      />

      {(related as any[])?.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Productos relacionados</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(related as any[]).map((rp: any) => {
              const firstVariant = rp.variants?.[0]
              const firstImage = firstVariant?.images?.[0]?.url || ""
              return (
                <Link
                  key={rp.id}
                  href={`/productos/${rp.id}`}
                  className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <Image
                      src={firstImage}
                      alt={rp.nombre}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-1 p-4">
                    <h3 className="font-semibold text-gray-900">{rp.nombre}</h3>
                    {rp.categories && (
                      <p className="text-xs text-gray-500">{rp.categories.nombre}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
