import { supabaseAdmin } from "@/lib/supabase"
import { deleteFromStorage, uploadMultipleToStorage } from "@/lib/upload"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id)

    const formData = await request.formData()
    const codigo = formData.get("codigo") as string
    const nombre = formData.get("nombre") as string
    const color = (formData.get("color") as string) || ""
    const descripcion = (formData.get("descripcion") as string) || ""
    const categoria_id = formData.get("categoria_id")
      ? Number(formData.get("categoria_id"))
      : null
    const keepImages = JSON.parse(
      (formData.get("keepImages") as string) || "[]"
    ) as string[]
    const newFiles = formData.getAll("newImages") as File[]

    if (!codigo || !nombre) {
      return NextResponse.json(
        { error: "Código y nombre son requeridos" },
        { status: 400 }
      )
    }

    const disponible = formData.get("disponible")
    const updateData: Record<string, any> = { codigo, nombre, color, descripcion, categoria_id }
    if (disponible === "true") {
      updateData.disponible = true
      updateData.fecha_activacion = new Date().toISOString()
    } else if (disponible === "false") {
      updateData.disponible = false
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select()
      .single()

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    const { data: oldImages } = await supabaseAdmin
      .from("product_images")
      .select("url")
      .eq("product_id", productId)

    let uploadedUrls: string[] = []

    try {
      const oldUrls = oldImages?.map((img) => img.url) || []
      const toDelete = oldUrls.filter((url) => !keepImages.includes(url))

      if (toDelete.length > 0) {
        await deleteFromStorage(toDelete)
      }

      await supabaseAdmin
        .from("product_images")
        .delete()
        .eq("product_id", productId)

      if (newFiles.length > 0) {
        uploadedUrls = await uploadMultipleToStorage(newFiles)
      }

      const allUrls = [...keepImages, ...uploadedUrls]
      if (allUrls.length > 0) {
        const imageRows = allUrls.map((url, i) => ({
          product_id: productId,
          url,
          sort_order: i,
        }))
        const { error: imgError } = await supabaseAdmin
          .from("product_images")
          .insert(imageRows)
        if (imgError) throw imgError
      }
    } catch (err) {
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
