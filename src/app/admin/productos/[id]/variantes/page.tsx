import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import VariantManager from "./VariantManager"

export const dynamic = "force-dynamic"

export default async function VariantesPage({
  params,
}: {
  params: { id: string }
}) {
  const productId = Number(params.id)

  const [productResult, variantsResult, colorsResult] = await Promise.all([
    supabase.from("products").select("id, nombre, codigo, slug").eq("id", productId).single(),
    supabase.from("product_variants").select("*").eq("product_id", productId).order("orden"),
    supabase.from("colors").select("*").eq("activo", true).order("nombre"),
  ])

  if (!productResult.data) notFound()

  const variantIds = (variantsResult.data || []).map((v) => v.id)

  const imagesResult = variantIds.length > 0
    ? await supabase
        .from("product_images")
        .select("*")
        .in("variant_id", variantIds)
        .order("sort_order")
    : { data: [] }

  const colorIds = Array.from(new Set((variantsResult.data || []).map((v: any) => v.color_id)))
  const colorsData = colorIds.length > 0
    ? await supabase.from("colors").select("*").in("id", colorIds)
    : { data: [] }

  const imagesByVariant: Record<number, any[]> = {}
  for (const img of imagesResult.data || []) {
    if (!imagesByVariant[img.variant_id]) imagesByVariant[img.variant_id] = []
    imagesByVariant[img.variant_id].push(img)
  }

  const colorMap: Record<number, any> = {}
  for (const c of colorsData.data || []) {
    colorMap[c.id] = c
  }

  const variantsWithImages = (variantsResult.data || []).map((v) => ({
    ...v,
    color: colorMap[v.color_id],
    images: imagesByVariant[v.id] || [],
  }))

  const product = productResult.data
  const allColors = colorsResult.data || []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Productos
        </Link>
        <Link
          href={`/admin/productos/${productId}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar Producto
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-primary-100 px-2 py-1 font-mono text-xs font-medium text-primary-700">
            {product.codigo}
          </span>
          <h1 className="text-xl font-bold text-gray-900">{product.nombre}</h1>
        </div>
      </div>

      <VariantManager
        productId={productId}
        initialVariants={variantsWithImages as any}
        allColors={allColors as any}
      />
    </div>
  )
}
