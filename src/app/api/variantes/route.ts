import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product_id, color_id } = body

    if (!product_id || !color_id) {
      return NextResponse.json(
        { error: "product_id y color_id son requeridos" },
        { status: 400 }
      )
    }

    const { data: existing } = await supabaseAdmin
      .from("product_variants")
      .select("id")
      .eq("product_id", product_id)
      .eq("color_id", color_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "Este color ya está asignado a este producto" },
        { status: 400 }
      )
    }

    const { data: maxOrden } = await supabaseAdmin
      .from("product_variants")
      .select("orden")
      .eq("product_id", product_id)
      .order("orden", { ascending: false })
      .limit(1)
      .single()

    const newOrden = (maxOrden?.orden ?? -1) + 1

    const { data: colorRow } = await supabaseAdmin
      .from("colors")
      .select("nombre")
      .eq("id", color_id)
      .single()

    const { data: variant, error } = await supabaseAdmin
      .from("product_variants")
      .insert({
        product_id,
        color_id,
        color: colorRow?.nombre || "",
        disponible: true,
        orden: newOrden,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath("/")
    revalidatePath("/admin/productos")
    revalidatePath(`/admin/productos/${product_id}/variantes`)
    return NextResponse.json(variant)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
