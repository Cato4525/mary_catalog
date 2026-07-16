import { supabaseAdmin } from "@/lib/supabase"
import { deleteFromStorage, uploadMultipleToStorage } from "@/lib/upload"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const nombre = formData.get("nombre") as string
    const codigo = (formData.get("codigo") as string)?.trim() || null
    const descripcion = (formData.get("descripcion") as string) || ""
    const categoria_id = formData.get("categoria_id")
      ? Number(formData.get("categoria_id"))
      : null
    const tipo_id = formData.get("tipo_id")
      ? Number(formData.get("tipo_id"))
      : null
    const variantsData = JSON.parse(
      (formData.get("variants_data") as string) || "[]"
    ) as { color_id: number }[]

    if (!nombre) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      )
    }

    if (variantsData.length === 0) {
      return NextResponse.json(
        { error: "Debe agregar al menos un color" },
        { status: 400 }
      )
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({ nombre, codigo, descripcion, categoria_id, tipo_id, disponible: true })
      .select()
      .single()

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    try {
      for (let i = 0; i < variantsData.length; i++) {
        const v = variantsData[i]
        const files = formData.getAll(`variant_images_${i}`) as File[]

        const { data: variant, error: variantError } = await supabaseAdmin
          .from("product_variants")
          .insert({ product_id: product.id, color_id: v.color_id, activo: true })
          .select()
          .single()

        if (variantError) throw variantError

        if (files.length > 0) {
          const uploadedUrls = await uploadMultipleToStorage(files)
          const imageRows = uploadedUrls.map((url, j) => ({
            variant_id: variant.id,
            url,
            sort_order: j,
          }))
          const { error: imgError } = await supabaseAdmin
            .from("product_images")
            .insert(imageRows)
          if (imgError) throw imgError
        }
      }
    } catch (err) {
      await supabaseAdmin.from("products").delete().eq("id", product.id)
      const message = err instanceof Error ? err.message : "Error al guardar variantes"
      return NextResponse.json({ error: message }, { status: 500 })
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
