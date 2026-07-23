import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id)

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

    const sizeIdsRaw = formData.get("size_ids") as string | null

    if (!nombre) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      )
    }

    const { error: productError } = await supabaseAdmin
      .from("products")
      .update({
        nombre,
        codigo,
        slug,
        descripcion,
        categoria_id,
        tipo_id,
        disponible,
        destacado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    if (sizeIdsRaw) {
      const sizeIds: number[] = JSON.parse(sizeIdsRaw)
      await supabaseAdmin.from("product_sizes").delete().eq("product_id", productId)
      if (sizeIds.length > 0) {
        const sizeRows = sizeIds.map((size_id) => ({
          product_id: productId,
          size_id,
          activo: true,
        }))
        await supabaseAdmin.from("product_sizes").upsert(sizeRows, { onConflict: "product_id,size_id" })
      }
    }

    revalidatePath("/")
    revalidatePath("/admin/productos")
    revalidatePath(`/admin/productos/${productId}`)
    return NextResponse.json({ id: productId })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
