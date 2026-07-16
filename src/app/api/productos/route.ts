import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const nombre = formData.get("nombre") as string
    const codigo = (formData.get("codigo") as string)?.trim() || null
    const slug = (formData.get("slug") as string)?.trim() || null
    const descripcion = (formData.get("descripcion") as string) || ""
    const categoria_id = formData.get("categoria_id")
      ? Number(formData.get("categoria_id"))
      : null
    const tipo_id = formData.get("tipo_id")
      ? Number(formData.get("tipo_id"))
      : null
    const disponible = formData.get("disponible") !== "false"
    const destacado = formData.get("destacado") === "true"

    if (!nombre) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      )
    }

    if (!codigo) {
      return NextResponse.json(
        { error: "Código es requerido" },
        { status: 400 }
      )
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        nombre,
        codigo,
        slug,
        descripcion,
        categoria_id,
        tipo_id,
        disponible,
        destacado,
      })
      .select()
      .single()

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    revalidatePath("/")
    revalidatePath("/admin/productos")
    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
