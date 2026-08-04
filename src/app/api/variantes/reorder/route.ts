import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { variant_ids } = body as { variant_ids: number[] }

    if (!Array.isArray(variant_ids) || variant_ids.length === 0) {
      return NextResponse.json(
        { error: "variant_ids es requerido y debe ser un array" },
        { status: 400 }
      )
    }

    const updates = variant_ids.map((id, index) =>
      supabaseAdmin
        .from("product_variants")
        .update({ orden: index })
        .eq("id", id)
    )

    await Promise.all(updates)

    const { data: first } = await supabaseAdmin
      .from("product_variants")
      .select("product_id")
      .eq("id", variant_ids[0])
      .single()

    revalidatePath("/")
    revalidatePath("/catalogo")
    if (first) revalidatePath(`/admin/productos/${first.product_id}/variantes`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
