import { supabaseAdmin } from "@/lib/supabase"
import { deleteFromStorage, uploadMultipleToStorage } from "@/lib/upload"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = Number(params.id)
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No se enviaron archivos" },
        { status: 400 }
      )
    }

    const { data: existing } = await supabaseAdmin
      .from("product_variants")
      .select("id, product_id")
      .eq("id", variantId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: "Variante no encontrada" },
        { status: 404 }
      )
    }

    const { data: maxImg } = await supabaseAdmin
      .from("product_images")
      .select("sort_order")
      .eq("variant_id", variantId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single()

    const startOrder = (maxImg?.sort_order ?? -1) + 1

    const uploadedUrls = await uploadMultipleToStorage(files)

    const imageRows = uploadedUrls.map((url, i) => ({
      variant_id: variantId,
      url,
      sort_order: startOrder + i,
    }))

    const { error: imgError } = await supabaseAdmin
      .from("product_images")
      .insert(imageRows)

    if (imgError) {
      return NextResponse.json({ error: imgError.message }, { status: 500 })
    }

    revalidatePath("/")
    revalidatePath("/catalogo")
    revalidatePath(`/admin/productos/${existing.product_id}/variantes`)
    return NextResponse.json({ urls: uploadedUrls })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get("imageId")

    if (!imageId) {
      return NextResponse.json(
        { error: "imageId es requerido" },
        { status: 400 }
      )
    }

    const { data: image } = await supabaseAdmin
      .from("product_images")
      .select("url, variant_id")
      .eq("id", Number(imageId))
      .single()

    if (!image) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      )
    }

    await deleteFromStorage([image.url])

    const { error } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("id", Number(imageId))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: variant } = await supabaseAdmin
      .from("product_variants")
      .select("product_id")
      .eq("id", image.variant_id)
      .single()

    revalidatePath("/")
    revalidatePath("/catalogo")
    if (variant) revalidatePath(`/admin/productos/${variant.product_id}/variantes`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
