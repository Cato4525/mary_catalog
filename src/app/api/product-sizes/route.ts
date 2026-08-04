import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json({ error: "product_id es requerido" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("product_sizes")
      .select("*, sizes(*)")
      .eq("product_id", Number(productId))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product_id, size_ids } = body as { product_id: number; size_ids: number[] }

    if (!product_id || !size_ids?.length) {
      return NextResponse.json(
        { error: "product_id y size_ids son requeridos" },
        { status: 400 }
      )
    }

    const rows = size_ids.map((size_id) => ({
      product_id,
      size_id,
      activo: true,
    }))

    const { error } = await supabaseAdmin
      .from("product_sizes")
      .upsert(rows, { onConflict: "product_id,size_id" })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath("/")
    revalidatePath("/catalogo")
    revalidatePath("/admin/productos")
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { product_id, size_id, activo } = body

    if (!product_id || !size_id) {
      return NextResponse.json(
        { error: "product_id y size_id son requeridos" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("product_sizes")
      .update({ activo })
      .eq("product_id", product_id)
      .eq("size_id", size_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath("/")
    revalidatePath("/catalogo")
    return NextResponse.json({ ok: true })
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
    const productId = searchParams.get("product_id")
    const sizeId = searchParams.get("size_id")

    if (!productId || !sizeId) {
      return NextResponse.json(
        { error: "product_id y size_id son requeridos" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("product_sizes")
      .delete()
      .eq("product_id", Number(productId))
      .eq("size_id", Number(sizeId))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath("/")
    revalidatePath("/catalogo")
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
