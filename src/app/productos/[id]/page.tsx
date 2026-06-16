import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import ProductGallery from "./ProductGallery"
import ProductWhatsAppButton from "@/components/ProductWhatsAppButton"

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

  const [products, productImages, category, settingsArr] = await Promise.all([
    api(`products?select=*&id=eq.${productId}`),
    api(`product_images?select=*&product_id=eq.${productId}&order=sort_order.asc`),
    (async () => {
      const p = await api(`products?select=categoria_id&id=eq.${productId}`)
      const catId = (p as any[])?.[0]?.categoria_id
      if (!catId) return null
      const c = await api(`categories?select=*&id=eq.${catId}`)
      return (c as any[])?.[0] || null
    })(),
    api("store_settings?id=eq.1&select=*"),
  ])
  const settings = (settingsArr as any[])?.[0] || null

  const product = (products as any[])?.[0]
  if (!product) notFound()

  const { data: related } = product.categoria_id
    ? await (async () => {
        const r = await api(`products?select=*&categoria_id=eq.${product.categoria_id}&id=neq.${product.id}&limit=4&order=created_at.desc`)
        const ids = (r as any[]).map((x: any) => x.id)
        const catIds = Array.from(
          new Set(
            (r as any[])
              .map((x: any) => x.categoria_id)
              .filter(Boolean)
          )
        ) as number[]
        const [rimg, rcats] = await Promise.all([
          ids.length ? api(`product_images?select=*&product_id=in.(${ids.join(",")})&order=sort_order.asc`) : Promise.resolve([]),
          catIds.length ? api(`categories?select=*&id=in.(${catIds.join(",")})`) : Promise.resolve([]),
        ])
        const byProd: Record<number, any[]> = {}
        for (const img of rimg as any[]) {
          if (!byProd[img.product_id]) byProd[img.product_id] = []
          byProd[img.product_id].push(img)
        }
        const byCat: Record<number, any> = {}
        for (const c of rcats as any[]) byCat[c.id] = c
        return {
          data: (r as any[]).map((x: any) => ({
            ...x,
            images: byProd[x.id] || [],
            categories: byCat[x.categoria_id] || null,
          })),
        }
      })()
    : { data: [] }

  const images = (productImages as any[])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((img: any) => img.url)

  const p = { ...product, images: productImages, categories: category }

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

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={images} productName={p.nombre} />

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-500">
              {p.codigo}
            </p>
            <h1 className="break-words text-3xl font-bold text-gray-900">{p.nombre}</h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            {p.categories && (
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                {p.categories.nombre}
              </span>
            )}
            <span>•</span>
            <span>{p.color}</span>
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{images.length} imágenes</span>
            </div>
          )}

          {p.descripcion && (
            <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
              {p.descripcion}
            </p>
          )}

          {settings?.whatsapp && images.length > 0 && (
            <ProductWhatsAppButton
              whatsapp={settings.whatsapp}
              codigo={p.codigo}
              nombre={p.nombre}
              imagenUrl={images[0]}
            />
          )}
        </div>
      </div>

      {(related as any[])?.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Productos relacionados</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(related as any[]).map((rp: any) => (
              <Link
                key={rp.id}
                href={`/productos/${rp.id}`}
                className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <Image
                    src={rp.images?.[0]?.url || ""}
                    alt={rp.nombre}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary-500">{rp.codigo}</p>
                  <h3 className="font-semibold text-gray-900">{rp.nombre}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
