import { supabaseAdmin } from "@/lib/supabase"
import { deleteFromStorage } from "@/lib/upload"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = Number(params.id)
    const body = await request.json()

    const updateData: Record<string, any> = {}

    if ("color_id" in body) {
      const { data: existing } = await supabaseAdmin
        .from("product_variants")
        .select("product_id, color_id")
        .eq("id", variantId)
        .single()

      if (existing) {
        const { data: dup } = await supabaseAdmin
          .from("product_variants")
          .select("id")
          .eq("product_id", existing.product_id)
          .eq("color_id", body.color_id)
          .neq("id", variantId)
          .single()

        if (dup) {
          return NextResponse.json(
            { error: "Este color ya está asignado a este producto" },
            { status: 400 }
          )
        }
      }
      updateData.color_id = body.color_id
    }

    if ("disponible" in body) {
      updateData.disponible = body.disponible
    }

    if ("orden" in body) {
      updateData.orden = body.orden
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No hay datos para actualizar" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("product_variants")
      .update(updateData)
      .eq("id", variantId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: variant } = await supabaseAdmin
      .from("product_variants")
      .select("product_id")
      .eq("id", variantId)
      .single()

    const productId = variant?.product_id

    revalidatePath("/")
    revalidatePath("/catalogo")
    revalidatePath("/admin/productos")
    if (productId) revalidatePath(`/admin/productos/${productId}/variantes`)
    return NextResponse.json({ id: variantId })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = Number(params.id)

    const { data: variant } = await supabaseAdmin
      .from("product_variants")
      .select("product_id")
      .eq("id", variantId)
      .single()

    const { data: images } = await supabaseAdmin
      .from("product_images")
      .select("url")
      .eq("variant_id", variantId)

    if (images && images.length > 0) {
      await deleteFromStorage(images.map((img) => img.url))
    }

    const { error } = await supabaseAdmin
      .from("product_variants")
      .delete()
      .eq("id", variantId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const productId = variant?.product_id
    revalidatePath("/")
    revalidatePath("/catalogo")
    revalidatePath("/admin/productos")
    if (productId) revalidatePath(`/admin/productos/${productId}/variantes`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
