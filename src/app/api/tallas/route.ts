import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const { data: sizes, error } = await supabaseAdmin
      .from("sizes")
      .select("*")
      .order("nombre")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(sizes)
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
    const { nombre } = body

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 })
    }

    const { data: size, error } = await supabaseAdmin
      .from("sizes")
      .insert({ nombre: nombre.trim() })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath("/admin/tallas")
    return NextResponse.json(size)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
