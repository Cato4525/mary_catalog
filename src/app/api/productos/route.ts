import { supabaseAdmin } from "@/lib/supabase"
import { uploadMultipleToStorage } from "@/lib/upload"
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
    const sizeIdsRaw = formData.get("size_ids") as string | null
    const colorsRaw = formData.get("colors") as string | null

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

    const productId = product.id

    if (sizeIdsRaw) {
      const sizeIds: number[] = JSON.parse(sizeIdsRaw)
      if (sizeIds.length > 0) {
        const sizeRows = sizeIds.map((size_id) => ({
          product_id: productId,
          size_id,
          activo: true,
        }))
        await supabaseAdmin.from("product_sizes").upsert(sizeRows, { onConflict: "product_id,size_id" })
      }
    }

    if (colorsRaw) {
      const colorEntries: { color_id: number; files_index: number[] }[] = JSON.parse(colorsRaw)

      for (const entry of colorEntries) {
        const { data: maxOrden } = await supabaseAdmin
          .from("product_variants")
          .select("orden")
          .eq("product_id", productId)
          .order("orden", { ascending: false })
          .limit(1)
          .single()

        const newOrden = (maxOrden?.orden ?? -1) + 1

        const { data: colorRow } = await supabaseAdmin
          .from("colors")
          .select("nombre")
          .eq("id", entry.color_id)
          .single()

        const { data: variant, error: varError } = await supabaseAdmin
          .from("product_variants")
          .insert({
            product_id: productId,
            color_id: entry.color_id,
            color: colorRow?.nombre || "",
            disponible: true,
            orden: newOrden,
          })
          .select()
          .single()

        if (varError || !variant) continue

        const files: File[] = []
        for (const idx of entry.files_index) {
          const file = formData.get(`color_file_${entry.color_id}_${idx}`) as File | null
          if (file && file.size > 0) {
            files.push(file)
          }
        }

        if (files.length > 0) {
          const uploadedUrls = await uploadMultipleToStorage(files)
          const imageRows = uploadedUrls.map((url, i) => ({
            variant_id: variant.id,
            url,
            sort_order: i,
          }))
          await supabaseAdmin.from("product_images").insert(imageRows)
        }
      }
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
