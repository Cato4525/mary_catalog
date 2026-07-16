import { supabaseAdmin } from "@/lib/supabase"
import { deleteFromStorage, uploadMultipleToStorage } from "@/lib/upload"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

interface VariantUpdate {
  id?: number
  color_id: number
  keepImages?: string[]
  sortOrder?: string[]
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id)

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
    const disponible = formData.get("disponible") !== "false"
    const variantsData = JSON.parse(
      (formData.get("variants_data") as string) || "[]"
    ) as VariantUpdate[]
    const deletedVariantIds = JSON.parse(
      (formData.get("deleted_variant_ids") as string) || "[]"
    ) as number[]

    if (!nombre) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      )
    }

    const { error: productError } = await supabaseAdmin
      .from("products")
      .update({ nombre, codigo, descripcion, categoria_id, tipo_id, disponible, updated_at: new Date().toISOString() })
      .eq("id", productId)

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    if (deletedVariantIds.length > 0) {
      const { data: deletedVariants } = await supabaseAdmin
        .from("product_variants")
        .select("id")
        .in("id", deletedVariantIds)
        .eq("product_id", productId)

      if (deletedVariants && deletedVariants.length > 0) {
        const dvIds = deletedVariants.map((v) => v.id)
        const { data: imagesToDelete } = await supabaseAdmin
          .from("product_images")
          .select("url")
          .in("variant_id", dvIds)

        if (imagesToDelete && imagesToDelete.length > 0) {
          await deleteFromStorage(imagesToDelete.map((img) => img.url))
        }

        await supabaseAdmin
          .from("product_variants")
          .delete()
          .in("id", dvIds)
      }
    }

    try {
      for (let i = 0; i < variantsData.length; i++) {
        const v = variantsData[i]
        const newFiles = formData.getAll(`variant_images_${i}`) as File[]

        let variantId: number

        if (v.id) {
          variantId = v.id
          await supabaseAdmin
            .from("product_variants")
            .update({ color_id: v.color_id })
            .eq("id", variantId)
        } else {
          const { data: newVariant, error: ve } = await supabaseAdmin
            .from("product_variants")
            .insert({ product_id: productId, color_id: v.color_id, activo: true })
            .select()
            .single()
          if (ve) throw ve
          variantId = newVariant.id
        }

        const { data: currentImages } = await supabaseAdmin
          .from("product_images")
          .select("url")
          .eq("variant_id", variantId)

        const currentUrls = currentImages?.map((img) => img.url) || []
        const keepImages = v.keepImages || []

        const toDeleteUrls = currentUrls.filter((url) => !keepImages.includes(url))
        if (toDeleteUrls.length > 0) {
          await deleteFromStorage(toDeleteUrls)
        }

        await supabaseAdmin
          .from("product_images")
          .delete()
          .eq("variant_id", variantId)

        let uploadedUrls: string[] = []
        if (newFiles.length > 0) {
          uploadedUrls = await uploadMultipleToStorage(newFiles)
        }

        const allUrls = [...keepImages, ...uploadedUrls]
        if (allUrls.length > 0) {
          const sortOrder = v.sortOrder || allUrls
          const imageRows = allUrls.map((url, j) => ({
            variant_id: variantId,
            url,
            sort_order: sortOrder.indexOf(url) !== -1 ? sortOrder.indexOf(url) : j,
          }))
          const { error: imgError } = await supabaseAdmin
            .from("product_images")
            .insert(imageRows)
          if (imgError) throw imgError
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar variantes"
      return NextResponse.json({ error: message }, { status: 500 })
    }

    revalidatePath("/")
    revalidatePath("/admin/productos")
    revalidatePath(`/productos/${productId}`)
    return NextResponse.json({ id: productId })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
