import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Category, ProductType, Color, Size } from "@/lib/types"
import ProductForm from "../ProductForm"

export default async function EditarProductoPage({
  params,
}: {
  params: { id: string }
}) {
  const productId = Number(params.id)

  const [
    productResult,
    categoriesResult,
    typesResult,
    colorsResult,
    sizesResult,
    productSizesResult,
    variantsResult,
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", productId).single(),
    supabase.from("categories").select("*").order("nombre"),
    supabase.from("product_types").select("*").order("nombre"),
    supabase.from("colors").select("*").eq("activo", true).order("nombre"),
    supabase.from("sizes").select("*").order("nombre"),
    supabase.from("product_sizes").select("size_id").eq("product_id", productId),
    supabase.from("product_variants").select("*").eq("product_id", productId).order("orden"),
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

  const productSizesIds = (productSizesResult.data || []).map((ps) => ps.size_id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
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
          href={`/admin/productos/${productId}/variantes`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100 active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Administrar Colores
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar Producto</h1>
      <ProductForm
        product={productResult.data as any}
        categories={(categoriesResult.data as Category[]) || []}
        productTypes={(typesResult.data as ProductType[]) || []}
        allColors={(colorsResult.data as Color[]) || []}
        allSizes={(sizesResult.data as Size[]) || []}
        productSizes={productSizesIds}
        productVariants={variantsWithImages as any}
      />
    </div>
  )
}
