import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const { data: colors, error } = await supabaseAdmin
      .from("colors")
      .select("*")
      .order("nombre")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(colors)
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
    const { nombre, codigo_hex } = body

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 })
    }

    const { data: color, error } = await supabaseAdmin
      .from("colors")
      .insert({ nombre: nombre.trim(), codigo_hex: codigo_hex || "#808080" })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath("/admin/colores")
    return NextResponse.json(color)
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
    const { id, activo } = body

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 })
    }

    const update: Record<string, unknown> = {}
    if (typeof activo === "boolean") update.activo = activo

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("colors")
      .update(update)
      .eq("id", Number(id))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath("/admin/colores")
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
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("colors")
      .delete()
      .eq("id", Number(id))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath("/admin/colores")
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
