import { supabaseAdmin } from "@/lib/supabase"
import { deleteFromStorage, uploadMultipleToStorage } from "@/lib/upload"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const codigo = formData.get("codigo") as string
    const nombre = formData.get("nombre") as string
    const color = (formData.get("color") as string) || ""
    const descripcion = (formData.get("descripcion") as string) || ""
    const categoria_id = formData.get("categoria_id")
      ? Number(formData.get("categoria_id"))
      : null
    const files = formData.getAll("images") as File[]

    if (!codigo || !nombre) {
      return NextResponse.json(
        { error: "Código y nombre son requeridos" },
        { status: 400 }
      )
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({ codigo, nombre, color, descripcion, categoria_id })
      .select()
      .single()

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    let uploadedUrls: string[] = []
    try {
      if (files.length > 0) {
        uploadedUrls = await uploadMultipleToStorage(files)

        const imageRows = uploadedUrls.map((url, i) => ({
          product_id: product.id,
          url,
          sort_order: i,
        }))

        const { error: imgError } = await supabaseAdmin
          .from("product_images")
          .insert(imageRows)

        if (imgError) {
          throw imgError
        }
      }
    } catch (err) {
      await supabaseAdmin.from("products").delete().eq("id", product.id)
      if (uploadedUrls.length > 0) {
        await deleteFromStorage(uploadedUrls)
      }
      const message = err instanceof Error ? err.message : "Error al guardar imágenes"
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
